import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteProject, duplicateProject, listProjects, renameProject, saveProject } from '../storage/db.ts';
import { parseProject, serializeProject } from '../storage/project.ts';
import type { Project } from '../storage/project.ts';
import { FAMILIES, getFamily } from '../families/index.ts';
import { download } from '../exporters/index.ts';
import { go } from '../ui/router.ts';

export function SavedPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const refresh = useCallback(() => { listProjects().then(setItems).catch(() => setMsg('Local storage is not available in this browser.')); }, []);
  useEffect(refresh, [refresh]);
  const importFile = async (f: File | undefined) => {
    if (!f) return;
    try { await saveProject(parseProject(await f.text(), FAMILIES)); setMsg('Project imported.'); refresh(); } catch (e) { setMsg(e instanceof Error ? e.message : 'Import failed.'); }
    if (file.current) file.current.value = '';
  };
  return (
    <div className="page">
      <h1>Saved designs</h1>
      <p className="muted">Designs are stored only in this browser (IndexedDB) on this device. They are not synchronised to other devices and can be lost if browser data is cleared. Use Export to keep a backup file.</p>
      <div className="actions"><button onClick={() => file.current?.click()}>Import project file</button><input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => importFile(e.target.files?.[0])} /></div>
      {msg && <p>{msg}</p>}
      <table className="tbl wide"><thead><tr><th>Name</th><th>Component</th><th>Updated</th><th /></tr></thead><tbody>
        {items.map((p) => (
          <tr key={p.id}><td>{p.name}</td><td>{getFamily(p.familyId)?.name ?? p.familyId}</td><td>{new Date(p.updatedAt).toLocaleString()}</td>
            <td className="actions">
              <button onClick={() => go(`designer/${p.familyId}?project=${p.id}`)}>Open</button>
              <button onClick={async () => { const n = window.prompt('New name', p.name); if (n) { await renameProject(p.id, n); refresh(); } }}>Rename</button>
              <button onClick={async () => { await duplicateProject(p.id); refresh(); }}>Duplicate</button>
              <button onClick={() => download({ name: `${p.name.replace(/[^\w-]+/g, '_')}.ultraplast.json`, blob: new Blob([serializeProject(p)], { type: 'application/json' }) })}>Export</button>
              <button onClick={async () => { if (window.confirm(`Delete "${p.name}"?`)) { await deleteProject(p.id); refresh(); } }}>Delete</button>
            </td></tr>
        ))}
        {!items.length && <tr><td colSpan={4} className="muted">No saved designs yet. Open a component and press "Save design".</td></tr>}
      </tbody></table>
    </div>
  );
}
