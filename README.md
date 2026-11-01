# Ultraplast Universal Conveyor Components Designer (v0.2)

Browser-based parametric design tool for Ultraplast Chainbelts Private Limited (https://www.ultraplastindia.com/).
Search a component, enter parameters, get calculated dimensions, a 2D drawing and a 3D model, then export CAD files.
**Every result is PRELIMINARY and must be validated by an engineer before manufacture.**

## What works in v0.2
| Area | Status |
|---|---|
| Search, autocomplete, category/material filters, recent items, related parts | Yes (12 families, about 370 variants, plus the 10-category coverage register) |
| Families | Roller chain sprocket (ISO 606 tooth profile), stepped shaft, deep-groove bearing, parallel key, washer, hex nut, bushing/sleeve/spacer, conveyor roller, hexagonal shaft, wear strip, angle guide rail, rectangular hollow section |
| Calculations | Per-family modules; inputs / calculated / assumptions / warnings kept separate (`docs/FORMULAS.md`) |
| 2D drawing | Dimensioned views, section, magnified tooth detail, isometric edge view, A3 title block with logo, zoom/pan, layer toggles, measure, **click to select any element and edit dimensions that are direct parameters** |
| 3D model | Orbit/zoom/pan, standard views, wireframe, section, exploded, hide/show parts, selection, finish controls |
| Assembly designer | Add/duplicate/remove parts, numeric position and rotation, nudge buttons, align on another part's axis, bore-to-shaft fit checks, chain consistency, interference check, exploded view, assembly 3D, assembly 2D drawing (4 views + BOM), BOM, save/open/import/export |
| Exports | DXF, SVG, PNG, PDF drawing (watermark), spec PDF, STL, OBJ, GLB, GLTF, STEP, BOM CSV, dimension/placement CSV, project JSON, full ZIP, for single parts and assemblies |
| Storage | Save/open/duplicate/rename/delete designs and assemblies (IndexedDB), project import/export |
| Not yet | Other categories (plastic chains and belts, motors, frames...), Ultraplast proprietary data, dragging parts in the 3D view. See `docs/LIMITATIONS.md` and the in-app Coverage page |

**Read `docs/LIMITATIONS.md` first.** The engineering logic has 59 passing automated tests, but the UI, 3D, PDF and STEP code were written without internet access and have not been run in a browser yet.

## Windows: first-time setup
1. Install **Node.js LTS** from https://nodejs.org (accept defaults). Restart your computer if asked.
2. Extract the ZIP. Open the `ultraplast-designer` folder, click the address bar, type `cmd` and press Enter.
3. **Add the logo:** copy your `Logo.png` into `public\assets\` (exact name `Logo.png`).
4. Install packages (needs internet, takes a few minutes):
   ```
   npm install
   ```
5. Pin the CAD kernel versions: run `npm ls replicad replicad-opencascadejs`, then in `package.json` replace both `"*"` with the shown version, for example `"^0.18.0"`, and run `npm install` again.
6. Start the app: `npm run dev` and open the address it prints (usually http://localhost:5173).
7. Run tests: `npm test`. Check types and build: `npm run build`.
8. Try the sample files in `samples\` via **Saved designs > Import project file**.

If something fails, copy the full red error text; it points to the exact file and line.

## Put it on GitHub and Vercel
1. Create a free account at https://github.com and click **New repository** (name: `ultraplast-designer`, keep it Private). Do not add a README.
2. Install **Git for Windows** (https://git-scm.com). In the project folder, in `cmd`:
   ```
   git init
   git add .
   git commit -m "Ultraplast designer v0.2"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/ultraplast-designer.git
   git push -u origin main
   ```
   (GitHub asks you to sign in in the browser the first time.)
3. Go to https://vercel.com, sign in with GitHub, click **Add New > Project**, pick the repository, and press **Deploy**. Vercel detects Vite automatically (`vercel.json` is included). You get a public `.vercel.app` address.
4. **Updating the live site:** replace the files in your folder with the new version (keep your `public\assets\Logo.png` and `node_modules` if present), then:
   ```
   git add .
   git commit -m "Update"
   git push
   ```
   Vercel rebuilds and redeploys within a minute or two.

## Technology and why
React + TypeScript + Vite (fast, type-safe, static hosting on Vercel). three.js + react-three-fiber (3D viewport). replicad on OpenCascade WebAssembly (true B-rep solids and genuine STEP export in the browser; no server). jsPDF (vector PDF), JSZip (packages), idb (IndexedDB). Vitest for tests. No databases, no extra hosting, no secrets.

## Architecture (short)
- `src/families/`: each family has pure calculation, 2D views and a `geo()` made of exact primitives (`src/core/prims.ts`). The 3D mesh, the STEP solid, the projected views and the assembly checks all derive from that one description.
- `src/assembly/`: placement, fit and interference rules, BOM, assembly drawing and exports.
- `src/cad2d/sheet.ts`: scales views, expands dimensions/hatching, builds the title block. SVG, DXF and PDF all consume the same sheet entities.
- `src/exporters/`: file writers. `src/storage/`: IndexedDB and project files. `src/data/`: standards tables and the catalogue register.

## Local storage warning
Saved designs live only in this browser on this computer. They are not synced between devices and can be erased with browser data. Use Export to back up.
