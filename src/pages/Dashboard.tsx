import { useState } from 'react';
import { FAMILIES, getFamily } from '../families/index.ts';
import { CATEGORIES, IMPLEMENTED, totalItems } from '../data/catalogue.ts';
import { getRecent } from '../lib/search.ts';
import { go } from '../ui/router.ts';
import { Icon } from '../ui/Icon.tsx';
import { Preview } from '../ui/Preview.tsx';
import { SearchBox } from './ComponentsPage.tsx';

export function Dashboard() {
  const [q, setQ] = useState('');
  const impl = Object.keys(IMPLEMENTED).length, variants = FAMILIES.reduce((a, f) => a + f.variants.length, 0);
  const recent = getRecent().map(getFamily).filter((f): f is NonNullable<typeof f> => !!f);
  const hero = FAMILIES[0];
  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <div>
            <span className="eyebrow">Ultraplast Chainbelts Private Limited</span>
            <h1>Design conveyor components <span>in minutes</span></h1>
            <p>Search a component, enter engineering parameters, and get calculated dimensions, 2D drawings, a 3D model and real CAD files. Combine parts into assemblies with fit and interference checks.</p>
            <SearchBox big value={q} onChange={setQ} onSubmit={(v) => go(`components?q=${encodeURIComponent(v)}`)} />
            <p className="muted" style={{ color: '#9db6d6', marginTop: 12, fontSize: 12.5 }}>All designs are PRELIMINARY until validated by a qualified engineer.</p>
          </div>
          <div className="hero-art"><Preview family={hero} /><div className="cap">{hero.name}: ISO 606 tooth profile, generated from parameters</div></div>
        </div>
      </section>
      <section className="stats">
        <div className="stat"><b>{FAMILIES.length}</b><span>component families</span></div>
        <div className="stat"><b>{variants}</b><span>ready-made variants</span></div>
        <div className="stat"><b>{impl}<small style={{ fontSize: 16, color: '#667385' }}> / {totalItems()}</small></b><span>catalogue items covered</span></div>
        <div className="stat"><b>13</b><span>real file formats exported</span></div>
      </section>
      <div className="page">
        <div className="section-title"><h2>How it works</h2></div>
        <div className="steps">
          <div className="step"><div className="ic"><Icon name="search" /></div><b>1. Find</b><p>Search by name, part number, material or standard.</p></div>
          <div className="step"><div className="ic"><Icon name="sliders" /></div><b>2. Specify</b><p>Enter parameters; formulas, limits and warnings update live.</p></div>
          <div className="step"><div className="ic"><Icon name="cube" /></div><b>3. Inspect</b><p>Dimensioned 2D sheets and a 3D model that stay in sync.</p></div>
          <div className="step"><div className="ic"><Icon name="download" /></div><b>4. Export</b><p>DXF, STEP, STL, PDF, BOM and a full ZIP package.</p></div>
        </div>
        {recent.length > 0 && <><div className="section-title"><h2>Recently used</h2></div><div className="chips">{recent.map((f) => <a key={f.id} className="chip" href={`#/designer/${f.id}`}>{f.name}</a>)}</div></>}
        <div className="section-title"><h2>Component families</h2><a href="#/components">Browse all</a></div>
        <div className="feat">{FAMILIES.map((f) => <a key={f.id} href={`#/designer/${f.id}`}><Preview family={f} /><b>{f.name}</b><span className="muted">{f.variants.length} variants</span></a>)}</div>
        <div className="section-title"><h2>Categories</h2></div>
        <div className="tiles">
          {CATEGORIES.map((c) => { const n = c.items.filter((i) => IMPLEMENTED[`${c.id}:${i}`]).length; return (
            <a key={c.id} className="tile" href={`#/components?cat=${c.id}`}><span className="letter">{c.id}</span><span className="tt"><b>{c.name}</b><span className="muted">{n} of {c.items.length} items implemented</span><div className="bar"><i style={{ width: `${(100 * n) / c.items.length}%` }} /></div></span></a>
          ); })}
        </div>
      </div>
    </>
  );
}
