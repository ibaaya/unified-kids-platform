// قوالب التلوين (SVG) — كل جزء قابل للتلوين بشكل مستقل
export type Shape =
  | { k: 'rect'; x: number; y: number; w: number; h: number; rx?: number }
  | { k: 'circle'; cx: number; cy: number; r: number }
  | { k: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { k: 'poly'; pts: string }
  | { k: 'path'; d: string };
export interface PaintPart { id: string; shapes: Shape[] }
export interface Template { viewBox: string; parts: PaintPart[]; ground?: boolean }

export const TEMPLATES: Record<string, Template> = {
  house: {
    viewBox: '0 0 200 160', ground: true,
    parts: [
      { id: 'sun',    shapes: [{ k: 'circle', cx: 172, cy: 28, r: 14 }] },
      { id: 'roof',   shapes: [{ k: 'poly', pts: '25,72 100,20 175,72' }] },
      { id: 'wall',   shapes: [{ k: 'rect', x: 45, y: 72, w: 110, h: 68 }] },
      { id: 'door',   shapes: [{ k: 'rect', x: 88, y: 100, w: 26, h: 40, rx: 3 }] },
      { id: 'window', shapes: [{ k: 'rect', x: 56, y: 86, w: 24, h: 22, rx: 3 }, { k: 'rect', x: 122, y: 86, w: 24, h: 22, rx: 3 }] },
    ],
  },
  flower: {
    viewBox: '0 0 200 160',
    parts: [
      { id: 'stem',   shapes: [{ k: 'rect', x: 97, y: 95, w: 6, h: 62 }] },
      { id: 'leaf',   shapes: [{ k: 'ellipse', cx: 124, cy: 128, rx: 18, ry: 8 }] },
      { id: 'petals', shapes: [{ k: 'circle', cx: 100, cy: 36, r: 20 }, { k: 'circle', cx: 126, cy: 62, r: 20 }, { k: 'circle', cx: 100, cy: 88, r: 20 }, { k: 'circle', cx: 74, cy: 62, r: 20 }] },
      { id: 'center', shapes: [{ k: 'circle', cx: 100, cy: 62, r: 15 }] },
    ],
  },
  fish: {
    viewBox: '0 0 200 160',
    parts: [
      { id: 'tail', shapes: [{ k: 'poly', pts: '140,80 188,48 188,112' }] },
      { id: 'fin',  shapes: [{ k: 'poly', pts: '82,48 104,18 122,52' }] },
      { id: 'body', shapes: [{ k: 'ellipse', cx: 90, cy: 80, rx: 56, ry: 36 }] },
      { id: 'eye',  shapes: [{ k: 'circle', cx: 62, cy: 72, r: 7 }] },
    ],
  },
  mosque: {
    viewBox: '0 0 200 160', ground: true,
    parts: [
      { id: 'tower',    shapes: [{ k: 'rect', x: 26, y: 56, w: 16, h: 84 }, { k: 'rect', x: 158, y: 56, w: 16, h: 84 }] },
      { id: 'towerTop', shapes: [{ k: 'poly', pts: '24,56 34,34 44,56' }, { k: 'poly', pts: '156,56 166,34 176,56' }] },
      { id: 'body',     shapes: [{ k: 'rect', x: 50, y: 88, w: 100, h: 52 }] },
      { id: 'dome',     shapes: [{ k: 'path', d: 'M58 88 A42 42 0 0 1 142 88 Z' }] },
      { id: 'door',     shapes: [{ k: 'path', d: 'M88 140 L88 114 A12 12 0 0 1 112 114 L112 140 Z' }] },
    ],
  },
};
