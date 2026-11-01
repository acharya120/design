# Engineering formulas used (v0.2)

All results are PRELIMINARY. Units: mm, N, MPa, kg unless stated. Material properties are typical values (see `src/data/materials.ts`) and must be confirmed with supplier data.

## Roller chain sprocket (ISO 606 / ASME B29.1)
- Pitch diameter d = p / sin(180/z); root diameter df = d - d1
- Tip diameter limits: da_max = d + 1.25 p - d1 ; da_min = d + p (1 - 1.6/z) - d1
- Roller seat radius ri: 0.505 d1 to 0.505 d1 + 0.069 d1^(1/3) (mean used)
- Seating angle alpha: 120 - 90/z to 140 - 90/z degrees (mean used, i.e. 130 - 90/z)
- Tooth flank radius re: min 0.12 d1 (z + 2), max 0.008 d1 (z^2 + 180) (mean used)
- Tooth plate width bf1 = 0.93 b1 (p <= 12.7) or 0.95 b1 (p > 12.7)
- Profile construction (all true arcs): seat arc of radius ri and included angle alpha, centred so its bottom sits on df/2; a flank arc of radius re tangent to the seat arc (S-curve, centre on the tooth side); a tip arc on da. If the flanks meet on the tooth centre line before reaching da (typical at the maximum tip diameter) the tooth is built pointed and the effective tip diameter is reported.
- **Verify the profile construction against the ISO 606 figure or your supplier drawing before relying on tooth shape.** The formulas are the standard's limit formulas; the arc arrangement is the author's reading of the standard. Tooth side chamfer/radius is not modelled.
- Keyways: DIN 6885-1 / ISO 773 table (`src/data/keys.ts`), bore 6 to 95 mm.

## Shafts
- Stepped shaft torsion: tau = 16 T / (pi d^3); allowable 0.577 Sy / SF; minimum diameter = cbrt(16 T / (pi tau_allow)). No bending, keyways or fatigue.
- Hex shaft: torsion estimated with the inscribed circle (conservative).

## Bearings (ISO 15)
Boundary dimensions d, D, B from the ISO 15 table. Ball size, count and ring sections are illustrative. No load rating or life.

## Keys (DIN 6885-1)
Force F = 2T/d. Shear = F/(b L). Contact pressure = F/((h - t1) L). Allowables: 0.577 Sy/SF and Sy/SF.

## Washers (ISO 7089), hex nuts (ISO 4032)
Standard dimension tables in `src/families/extra/fasteners.ts`. Nut across corners e = s / cos 30 degrees. Threads not modelled.

## Roller
Tube I = pi/64 (D^4 - d^4). Simply supported, uniform load F: deflection = 5 F L^3 / (384 E I); stress = (F L / 8)(D/2) / I. Warn if deflection exceeds L/1000.

## Profiles
- Angle: area, centroid and second moments by polygon integration.
- Rectangular hollow section: A = wh - (w-2t)(h-2t); Ix = (w h^3 - (w-2t)(h-2t)^3)/12. Beam, central point load: M = F L/4, sigma = M (h/2)/Ix, deflection = F L^3/(48 E Ix); warn above span/250.

## Assembly checks
- Bore fit: gap = bore - shaft section diameter; |gap| <= 0.05 nominal, <= 0.1 acceptable, <= 0.5 loose (warning), bore < shaft = error (interference fit not modelled). Threaded holes (nuts, washers) only require hole >= shaft.
- Interference: exact for coaxial round parts (radial and axial range overlap, tolerance 0.01 mm). Non-coaxial parts use bounding boxes (reported as "may interfere"). Keys are skipped (keyways not modelled).

## Adding verified data
Standard tables live in `src/data/`. Proprietary Ultraplast chain/belt data must come from your catalogue; do not guess values.
