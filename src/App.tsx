import { useRoute } from './ui/router.ts';
import { Logo } from './ui/Logo.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { ComponentsPage } from './pages/ComponentsPage.tsx';
import { DesignerPage } from './pages/DesignerPage.tsx';
import { SavedPage } from './pages/SavedPage.tsx';
import { AboutPage, CoveragePage, HelpPage } from './pages/InfoPages.tsx';
import { AssemblyPage } from './pages/AssemblyPage.tsx';

const NAV: [string, string][] = [['dashboard', 'Dashboard'], ['components', 'Components'], ['designer', '2D / 3D Designer'], ['assembly', 'Assembly'], ['saved', 'Saved designs'], ['coverage', 'Coverage'], ['help', 'Help'], ['about', 'About']];

export default function App() {
  const r = useRoute();
  const page = r.path[0] ?? 'dashboard';
  const key = r.path.join('/') + '?' + r.query.toString();
  return (
    <div className="app">
      <header className="top">
        <a href="#/dashboard" className="brand"><Logo height={34} box /><span>Conveyor Designer<small>CAD automation</small></span></a>
        <nav>{NAV.map(([k, l]) => <a key={k} href={`#/${k}`} className={page === k ? 'on' : ''}>{l}</a>)}</nav>
      </header>
      <main>
        {page === 'dashboard' && <Dashboard />}
        {page === 'components' && <ComponentsPage key={key} query={r.query} />}
        {page === 'designer' && <DesignerPage key={key} familyId={r.path[1]} query={r.query} />}
        {page === 'assembly' && <AssemblyPage />}
        {page === 'saved' && <SavedPage />}
        {page === 'coverage' && <CoveragePage />}
        {page === 'help' && <HelpPage />}
        {page === 'about' && <AboutPage />}
        {!NAV.some(([k]) => k === page) && <div className="page"><h1>Page not found</h1><a href="#/dashboard">Back to dashboard</a></div>}
      </main>
      <footer><div className="foot"><Logo height={24} box /><span>Ultraplast Chainbelts Private Limited. Designs are PRELIMINARY and not validated for manufacture.</span><a href="https://www.ultraplastindia.com/" target="_blank" rel="noreferrer">ultraplastindia.com</a></div></footer>
    </div>
  );
}
