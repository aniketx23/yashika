import type { CSSProperties } from 'react';

/** Normalised 0–1 coordinates; `m` is relative magnitude (draw weight). */
export interface StarPoint {
  x: number;
  y: number;
  m: number;
  n: string;
}
export type Edge = readonly [number, number];

export const LEO: readonly StarPoint[] = [
  { x: 0.13, y: 0.6, m: 2.1, n: 'DENEBOLA' },
  { x: 0.3, y: 0.7, m: 1.4, n: 'CHERTAN' },
  { x: 0.27, y: 0.46, m: 1.7, n: 'ZOSMA' },
  { x: 0.56, y: 0.4, m: 1.9, n: 'ALGIEBA' },
  { x: 0.62, y: 0.78, m: 2.8, n: 'REGULUS' },
  { x: 0.6, y: 0.58, m: 1.3, n: 'ETA LEONIS' },
  { x: 0.49, y: 0.28, m: 1.4, n: 'ZETA' },
  { x: 0.4, y: 0.19, m: 1.5, n: 'RASALAS' },
  { x: 0.3, y: 0.25, m: 1.6, n: 'ALGENUBI' },
];
export const LEO_EDGES: readonly Edge[] = [
  [8, 7], [7, 6], [6, 3], [3, 5], [5, 4], [3, 2], [2, 0], [0, 1], [1, 4], [2, 1],
];

/** Canis Major — Sirius' own constellation. */
export const CMA: readonly StarPoint[] = [
  { x: 0.34, y: 0.22, m: 3.2, n: 'SIRIUS' },
  { x: 0.2, y: 0.32, m: 1.6, n: 'MIRZAM' },
  { x: 0.42, y: 0.4, m: 1.2, n: '' },
  { x: 0.54, y: 0.66, m: 1.8, n: 'WEZEN' },
  { x: 0.36, y: 0.76, m: 1.7, n: 'ADHARA' },
  { x: 0.7, y: 0.7, m: 1.4, n: 'ALUDRA' },
  { x: 0.24, y: 0.9, m: 1.3, n: 'FURUD' },
];
export const CMA_EDGES: readonly Edge[] = [[0, 1], [0, 2], [2, 3], [3, 4], [3, 5], [4, 6], [2, 4]];

/** Corona Borealis — the crown. */
export const CB: readonly StarPoint[] = [
  { x: 0.12, y: 0.58, m: 1.2, n: '' },
  { x: 0.23, y: 0.4, m: 1.4, n: '' },
  { x: 0.36, y: 0.3, m: 1.5, n: '' },
  { x: 0.5, y: 0.27, m: 2.4, n: 'ALPHECCA' },
  { x: 0.64, y: 0.32, m: 1.5, n: '' },
  { x: 0.76, y: 0.43, m: 1.3, n: '' },
  { x: 0.86, y: 0.6, m: 1.2, n: '' },
];
export const CB_EDGES: readonly Edge[] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]];

/* ---------------------------------------------------------------- SVG maps */

/**
 * The decorative section maps share one geometry and three treatments.
 *
 * The constellation name is the only text on a map — set like the MAHAYA
 * easter egg: oversized Bodoni at the edge of legibility, sitting behind the
 * drawing. Member stars are deliberately unlabelled.
 */
export interface MapConfig {
  stars: readonly StarPoint[];
  edges: readonly Edge[];
  name: string;
  /** Baseline inside the 400×300 viewBox. */
  nameY: number;
  nameSize: number;
  lineStroke: string;
  lineGlow: boolean;
  lineDuration: number;
  haloFill: string;
  /** Never wider than its section — the map must not run off screen. */
  placement: CSSProperties;
}

/** Every name is stretched to this width, so all three read as one device. */
export const NAME_WIDTH = 340;

const centred = (max: number, opacity: number): CSSProperties => ({
  left: '50%',
  transform: 'translateX(-50%)',
  width: `min(100%, ${max}px)`,
  opacity,
});

export const MAPS = {
  leo: {
    stars: LEO,
    edges: LEO_EDGES,
    name: 'LEO',
    nameY: 196,
    nameSize: 118,
    lineStroke: 'rgba(240,180,41,.4)',
    lineGlow: true,
    lineDuration: 1.6,
    haloFill: 'rgba(240,180,41,.13)',
    placement: { ...centred(620, 0.78), top: '2%' },
  },
  cma: {
    stars: CMA,
    edges: CMA_EDGES,
    name: 'CANIS MAJOR',
    nameY: 200,
    nameSize: 62,
    lineStroke: 'rgba(237,234,255,.3)',
    lineGlow: false,
    lineDuration: 1.6,
    haloFill: 'rgba(237,234,255,.1)',
    placement: { ...centred(560, 0.72), top: 0 },
  },
  cb: {
    stars: CB,
    edges: CB_EDGES,
    name: 'CORONA BOREALIS',
    nameY: 200,
    nameSize: 46,
    lineStroke: 'rgba(240,180,41,.32)',
    lineGlow: false,
    lineDuration: 1.5,
    haloFill: 'rgba(240,180,41,.1)',
    placement: { ...centred(540, 0.7), top: 0 },
  },
} as const satisfies Record<string, MapConfig>;

/** The SVG maps are authored against a 400×300 viewBox. */
export const MAP_VIEWBOX = { w: 400, h: 300 } as const;

export interface PlottedStar {
  x: number;
  y: number;
  r: number;
  halo: number;
  delay: number;
  fill: string;
  glow: string;
}

export function plotStars(set: readonly StarPoint[]): PlottedStar[] {
  const { w, h } = MAP_VIEWBOX;
  return set.map((s, i) => {
    const r = 1.6 + s.m * 1.1;
    const bright = s.m > 2;
    return {
      x: +(s.x * w).toFixed(1),
      y: +(s.y * h).toFixed(1),
      r: +r.toFixed(1),
      halo: +(r * 3.2).toFixed(1),
      delay: +(i * 0.09).toFixed(2),
      fill: bright ? '#FFE9B0' : '#EDEAFF',
      glow: `drop-shadow(0 0 ${bright ? 12 : 6}px rgba(240,180,41,${bright ? 0.95 : 0.6}))`,
    };
  });
}

export interface PlottedLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

export function plotLines(set: readonly StarPoint[], edges: readonly Edge[]): PlottedLine[] {
  const { w, h } = MAP_VIEWBOX;
  return edges.map(([a, b], i) => {
    const from = set[a]!;
    const to = set[b]!;
    return {
      x1: +(from.x * w).toFixed(1),
      y1: +(from.y * h).toFixed(1),
      x2: +(to.x * w).toFixed(1),
      y2: +(to.y * h).toFixed(1),
      delay: +(0.25 + i * 0.11).toFixed(2),
    };
  });
}
