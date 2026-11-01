import { useEffect, useMemo, useState } from 'react';
import { getFamily } from '../families/index.ts';
import type { Params } from '../core/types.ts';
import { buildDesign } from '../lib/design.ts';
import { pushRecent } from '../lib/search.ts';
import { ParamForm } from '../ui/ParamForm.tsx';
import { DrawingWorkspace } from '../ui/DrawingWorkspace.tsx';
import { Viewer3D } from '../ui/Viewer3D.tsx';
import { KINDS, buildPackage, download, makeArtifact, sourceFromDesign } from '../exporters/index.ts';
import { geoToParts } from '../core/prims3d.ts';
import type { Kind } from '../exporters/index.ts';
import { getProject, saveProject } from '../storage/db.ts';
import { newId } from '../storage/project.ts';
import { go } from '../ui/router.ts';

type Tab = '2d' | '3d' | 'calc' | 'export';

export function DesignerPage({ familyId, query }: { familyId: string | undefined; query: URLSearchParams }) {
  const family = familyId ? getFamily(familyId) : undefined;
  const [params, setParams] = useState<Params>(family?.defaults ?? {});
  const [rev, setRev] = useState('A');
  const [tab, setTab] = useState<Tab>('2d');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!family) return;
    pushRecent(family.id);
    const pid = query.get('project'), vid = query.get('variant');
    if (pid) getProject(pid).then((p) => { if (p && p.familyId === family.id) { setParams(p.params); setRev(p.revision); setProjectId(p.id); setName(p.name); } else setMsg('Saved design not found in this browser.'); }).catch(() => setMsg('Could not read local storage.'));
    else if (vid) { const v = family.variants.find((x) => x.id === vid); if (v) setParams({ ...v.params }); }
  }, [family, query]);

  const design = useMemo(() => (family ? buildDesign(family, params, rev) : null), [family, params, rev]);
  const parts = useMemo(() => (design?.geo ? geoToParts(design.geo) : null), [design]);
  useEffect(() => () => { parts?.forEach((p) => p.geometry.dispose()); }, [parts]);

  if (!family || !design) {
    return <div className="page"><h1>Designer</h1><p>Select a component first. <a href="#/components">Browse components</a></p></div>;
  }
  const { calc } = design;

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true); setMsg(`${label}...`);
    try { await fn(); setMsg(`${label}: done.`); } catch (e) { setMsg(`${label} failed: ${e instanceof Error ? e.message : String(e)}`); } finally { setBusy(false); }
  };
  const exportOne = (k: Kind) => run(`Export ${k}`, async () => { setMsg(k === 'step' ? 'Loading CAD kernel for STEP (first use downloads ~10 MB)...' : `Generating ${k}...`); download(await makeArtifact(k, sourceFromDesign(design, family.id, name || design.partNo))); });
  const save = () => run('Save', async () => {
    const title = name || window.prompt('Name for this design:', design.partNo);
    if (!title) throw new Error('cancelled');
    const now = new Date().toISOString(), id = projectId ?? newId();
    await saveProject({ id, name: title, familyId: family.id, params, revision: rev, createdAt: now, updatedAt: now });
    setProjectId(id); setName(title);
  });

  return (
    <div className="designer">
      <aside className="panel">
        <h2>{family.name} <span className="badge">PRELIMINARY</span></h2>
        <label className="field"><span>Variant</span>
          <select value="" onChange={(e) => { const v = family.variants.find((x) => x.id === e.target.value); if (v) setParams({ ...v.params }); }}>
            <option value="">Load a ready-made variant ({family.variants.length})...</option>
            {family.variants.map((v) => <option key={v.id} value={v.id}>{v.id}</option>)}
          </select></label>
        <ParamForm fields={family.fields} params={params} onChange={setParams} />
        <label className="field"><span>Drawing revision</span><input value={rev} maxLength={3} onChange={(e) => setRev(e.target.value.toUpperCase())} /></label>
        <div className="actions"><button className="primary" onClick={save} disabled={busy}>{projectId ? 'Save changes' : 'Save design'}</button><button onClick={() => { setParams({ ...family.defaults }); }}>Reset</button></div>
        <div className="actions"><button disabled={!calc.ok} onClick={() => { sessionStorage.setItem('ultraplast.asm.add', JSON.stringify({ familyId: family.id, params })); go('assembly'); }}>Add to assembly</button></div>
        {calc.errors.length > 0 && <div className="box err"><b>Cannot generate geometry:</b><ul>{calc.errors.map((e) => <li key={e}>{e}</li>)}</ul></div>}
        {calc.ok && calc.warnings.length > 0 && <div className="box warn"><b>Engineering warnings</b><ul>{calc.warnings.map((e) => <li key={e}>{e}</li>)}</ul></div>}
        {msg && <p className="muted">{msg}</p>}
      </aside>
      <section className="work">
        <nav className="tabs">{([['2d', '2D drawing'], ['3d', '3D model'], ['calc', 'Calculations & specification'], ['export', 'Downloads']] as [Tab, string][]).map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
        {!calc.ok && <div className="box err big"><b>Design is incomplete or incompatible.</b> Fix the highlighted inputs to generate the drawing and model.</div>}
        {calc.ok && tab === '2d' && design.sheet && <DrawingWorkspace sheet={design.sheet} onEdit={(k, v) => setParams((p) => ({ ...p, [k]: v }))} />}
        {calc.ok && tab === '3d' && parts && <Viewer3D key={family.id} parts={parts} />}
        {tab === 'calc' && (
          <div className="calc">
            <h3>Inputs</h3><Table rows={calc.inputs} />
            <h3>Calculated values</h3>{calc.calculated.length ? <Table rows={calc.calculated} /> : <p className="muted">Not available until inputs are valid.</p>}
            <h3>Assumptions</h3><ul>{calc.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
            <h3>Applicable standards</h3><ul>{calc.standards.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
        )}
        {tab === 'export' && (
          <div className="calc">
            <p className="muted">Every file below is generated from the current parameters. If a format cannot be produced, the error is shown rather than a placeholder being downloaded.</p>
            {(['2D', '3D', 'Documents'] as const).map((g) => (
              <div key={g}><h3>{g === 'Documents' ? 'Reports and data' : `${g} files`}</h3><div className="actions wrap">{KINDS.filter((k) => k.group === g).map((k) => <button key={k.kind} disabled={busy || !calc.ok} onClick={() => exportOne(k.kind)}>{k.label}</button>)}</div></div>
            ))}
            <h3>Complete design package</h3>
            <button className="primary" disabled={busy || !calc.ok} onClick={() => run('Package', async () => { download(await buildPackage(sourceFromDesign(design, family.id, name || design.partNo), setMsg)); })}>Download ZIP package</button>
            <p className="muted">STEP is built with an OpenCascade kernel in your browser. It needs a modern browser and loads a ~10 MB file the first time.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Table({ rows }: { rows: { label: string; value: string; unit?: string }[] }) {
  return <table className="tbl"><tbody>{rows.map((r) => <tr key={r.label}><td>{r.label}</td><td className="num">{r.value}</td><td>{r.unit ?? ''}</td></tr>)}</tbody></table>;
}
