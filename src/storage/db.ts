import { openDB } from 'idb';
import type { AssemblyLike, Project } from './project.ts';
import { newId } from './project.ts';

const dbp = () => openDB('ultraplast-designer', 2, { upgrade(d) { if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' }); if (!d.objectStoreNames.contains('assemblies')) d.createObjectStore('assemblies', { keyPath: 'id' }); } });

export async function listProjects(): Promise<Project[]> {
  const all: Project[] = await (await dbp()).getAll('projects');
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function getProject(id: string): Promise<Project | undefined> { return (await dbp()).get('projects', id); }
export async function saveProject(p: Project): Promise<void> { await (await dbp()).put('projects', { ...p, updatedAt: new Date().toISOString() }); }
export async function deleteProject(id: string): Promise<void> { await (await dbp()).delete('projects', id); }
export async function duplicateProject(id: string): Promise<Project | undefined> {
  const p = await getProject(id);
  if (!p) return undefined;
  const now = new Date().toISOString();
  const copy = { ...p, id: newId(), name: `${p.name} (copy)`, createdAt: now, updatedAt: now };
  await saveProject(copy);
  return copy;
}
export async function renameProject(id: string, name: string): Promise<void> {
  const p = await getProject(id);
  if (p) await saveProject({ ...p, name: name.trim().slice(0, 120) || p.name });
}

export async function listAssemblies(): Promise<AssemblyLike[]> { return ((await (await dbp()).getAll('assemblies')) as AssemblyLike[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
export async function saveAssembly(a: AssemblyLike): Promise<void> { await (await dbp()).put('assemblies', { ...a, updatedAt: new Date().toISOString() }); }
export async function deleteAssembly(id: string): Promise<void> { await (await dbp()).delete('assemblies', id); }
