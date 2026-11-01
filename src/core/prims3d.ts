import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Part3D } from './family.ts';
import type { GeoPart, Prim } from './prims.ts';

function primGeometry(p: Prim): THREE.BufferGeometry {
  let g: THREE.BufferGeometry;
  if (p.kind === 'tube') {
    const pts = [[p.rIn, p.z0], [p.rOut, p.z0], [p.rOut, p.z1], [p.rIn, p.z1], [p.rIn, p.z0]].map((q) => new THREE.Vector2(q[0], q[1]));
    g = new THREE.LatheGeometry(pts, 96);
    g.rotateX(Math.PI / 2); // lathe axis Y -> part axis Z (y range maps onto z)
  } else if (p.kind === 'sphere') {
    g = new THREE.SphereGeometry(p.r, 28, 18);
    g.translate(p.c[0], p.c[1], p.c[2]);
  } else {
    const shape = new THREE.Shape(p.outer.map((q) => new THREE.Vector2(q[0], q[1])));
    for (const h of p.holes) {
      const pts = 'poly' in h ? h.poly : Array.from({ length: 64 }, (_, i) => [h.c[0] + h.r * Math.cos((2 * Math.PI * i) / 64), h.c[1] + h.r * Math.sin((2 * Math.PI * i) / 64)] as [number, number]);
      shape.holes.push(new THREE.Path(pts.map((q) => new THREE.Vector2(q[0], q[1]))));
    }
    g = new THREE.ExtrudeGeometry(shape, { depth: p.z1 - p.z0, bevelEnabled: false, steps: 1 });
    g.translate(0, 0, p.z0);
  }
  return g.index ? g.toNonIndexed() : g;
}

export function geoToParts(geo: GeoPart[]): Part3D[] {
  return geo.map((g) => {
    const gs = g.prims.map(primGeometry);
    return { id: g.id, name: g.name, geometry: gs.length === 1 ? gs[0] : mergeGeometries(gs)!, color: g.color, explode: g.explode };
  });
}
