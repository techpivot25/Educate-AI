export type SubjectLottieVariant =
  | 'physics'
  | 'chemistry'
  | 'maths'
  | 'biology'
  | 'coding'
  | 'history'
  | 'geography'
  | 'english'
  | 'general';

export type NavLottieName =
  | 'dashboard'
  | 'formulas'
  | 'passport'
  | 'grades'
  | 'quiz'
  | 'sparkles'
  | 'award'
  | 'community'
  | 'flame'
  | 'zap'
  | 'timer'
  | 'barchart';

type RGB = [number, number, number, number];

const hexToRgba = (hex: string, alpha = 1): RGB => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [Number(r.toFixed(3)), Number(g.toFixed(3)), Number(b.toFixed(3)), alpha];
};

const s1D = (val: number) => ({ a: 0, k: val });
const sVec = (val: number[]) => ({ a: 0, k: val });

const anim1D = (keys: Array<[number, number]>) => ({
  a: 1,
  k: keys.map(([t, v], idx) =>
    idx === keys.length - 1
      ? { t, s: [v] }
      : {
          t,
          s: [v],
          i: { x: [0.42], y: [1] },
          o: { x: [0.58], y: [0] },
        }
  ),
});

const anim2D = (keys: Array<[number, [number, number]]>) => ({
  a: 1,
  k: keys.map(([t, v], idx) =>
    idx === keys.length - 1
      ? { t, s: v }
      : {
          t,
          s: v,
          i: { x: [0.42, 0.42], y: [1, 1] },
          o: { x: [0.58, 0.58], y: [0, 0] },
        }
  ),
});

const fill = (hex: string, opacity = 100) => ({
  ty: 'fl',
  c: sVec(hexToRgba(hex)),
  o: s1D(opacity),
  r: 1,
  nm: 'Fill',
});

const stroke = (hex: string, width = 2.2, opacity = 100, dashed = false) => ({
  ty: 'st',
  c: sVec(hexToRgba(hex)),
  o: s1D(opacity),
  w: s1D(width),
  lc: 2,
  lj: 2,
  ...(dashed
    ? {
        d: [
          { n: 'd', nm: 'dash', v: s1D(3.2) },
          { n: 'g', nm: 'gap', v: s1D(2.8) },
        ],
      }
    : {}),
  nm: 'Stroke',
});

const tr = (opts?: {
  p?: any;
  a?: any;
  s?: any;
  r?: any;
  o?: any;
}) => ({
  ty: 'tr',
  p: opts?.p ?? sVec([0, 0]),
  a: opts?.a ?? sVec([0, 0]),
  s: opts?.s ?? sVec([100, 100]),
  r: opts?.r ?? s1D(0),
  o: opts?.o ?? s1D(100),
});

const ellipse = (cx: number, cy: number, w: number, h: number) => ({
  ty: 'el',
  d: 1,
  p: sVec([cx, cy]),
  s: sVec([w, h]),
  nm: 'Ellipse',
});

const rect = (cx: number, cy: number, w: number, h: number, radius = 0) => ({
  ty: 'rc',
  d: 1,
  p: sVec([cx, cy]),
  s: sVec([w, h]),
  r: s1D(radius),
  nm: 'Rect',
});

const path = (v: number[][], i?: number[][], o?: number[][], c = true) => ({
  ty: 'sh',
  d: 1,
  ks: {
    a: 0,
    k: {
      c,
      v,
      i: i ?? v.map(() => [0, 0]),
      o: o ?? v.map(() => [0, 0]),
    },
  },
  nm: 'Path',
});

const shapeLayer = (
  ind: number,
  nm: string,
  items: any[],
  ks?: { p?: any; a?: any; s?: any; r?: any; o?: any }
) => ({
  ddd: 0,
  ind,
  ty: 4,
  nm,
  sr: 1,
  ks: {
    o: ks?.o ?? s1D(100),
    r: ks?.r ?? s1D(0),
    p: ks?.p ?? sVec([24, 24, 0]),
    a: ks?.a ?? sVec([24, 24, 0]),
    s: ks?.s ?? sVec([100, 100, 100]),
  },
  ao: 0,
  shapes: [
    {
      ty: 'gr',
      nm: `${nm}-grp`,
      it: items,
    },
  ],
  ip: 0,
  op: 60,
  st: 0,
  bm: 0,
});

const doc = (nm: string, layers: any[]) => ({
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 60,
  w: 48,
  h: 48,
  nm,
  ddd: 0,
  assets: [],
  layers,
});

export const getSubjectLottieData = (variant: SubjectLottieVariant) => {
  switch (variant) {
    case 'physics':
      return doc('physics-atom', [
        shapeLayer(
          1,
          'nucleus',
          [ellipse(24, 24, 9.2, 9.2), fill('#7C3AED'), tr()],
          { s: anim2D([[0, [100, 100]], [30, [114, 114]], [60, [100, 100]]]) }
        ),
        shapeLayer(2, 'ring-vert', [ellipse(24, 24, 15, 36), stroke('#C4B5FD', 1.7, 85), tr()], {
          r: anim1D([[0, 0], [60, 180]]),
        }),
        shapeLayer(
          3,
          'ring-solid',
          [
            ellipse(24, 24, 37, 15),
            stroke('#8B5CF6', 2),
            tr({ p: sVec([24, 24]), a: sVec([24, 24]), r: s1D(38) }),
          ],
          { r: anim1D([[0, 0], [60, 360]]) }
        ),
        shapeLayer(
          4,
          'ring-dash',
          [
            ellipse(24, 24, 37, 15),
            stroke('#7C3AED', 2, 100, true),
            tr({ p: sVec([24, 24]), a: sVec([24, 24]), r: s1D(-38) }),
          ],
          { r: anim1D([[0, 0], [60, -360]]) }
        ),
        shapeLayer(5, 'electron-1', [ellipse(34.5, 14, 5.2, 5.2), fill('#7C3AED'), stroke('#FFFFFF', 1), tr()], {
          r: anim1D([[0, 0], [60, 360]]),
        }),
        shapeLayer(6, 'electron-2', [ellipse(13.5, 33.5, 4.8, 4.8), fill('#A78BFA'), stroke('#FFFFFF', 0.9), tr()], {
          r: anim1D([[0, 0], [60, -360]]),
        }),
      ]);

    case 'chemistry':
      return doc('chemistry-flask', [
        shapeLayer(
          1,
          'bubble-1',
          [ellipse(20.5, 34, 3.6, 3.6), fill('#D1FAE5'), tr()],
          {
            p: anim2D([[0, [24, 26]], [40, [24, 12]], [60, [24, 26]]]),
            o: anim1D([[0, 95], [40, 25], [60, 95]]),
          }
        ),
        shapeLayer(
          2,
          'bubble-2',
          [ellipse(26.8, 32, 2.8, 2.8), fill('#A7F3D0'), tr()],
          {
            p: anim2D([[0, [24, 22]], [30, [24, 8]], [60, [24, 22]]]),
            o: anim1D([[0, 50], [30, 100], [60, 50]]),
          }
        ),
        shapeLayer(
          3,
          'bubble-3',
          [ellipse(24, 21, 2.4, 2.4), fill('#10B981'), tr()],
          {
            p: anim2D([[0, [24, 24]], [35, [24, 10]], [60, [24, 24]]]),
            o: anim1D([[0, 20], [35, 95], [60, 20]]),
          }
        ),
        shapeLayer(
          4,
          'liquid',
          [
            path([[16.2, 26.2], [24, 26], [31.8, 26.2], [36.8, 34.5], [34.5, 38], [13.5, 38], [11.2, 34.5]]),
            fill('#059669'),
            tr(),
          ],
          { r: anim1D([[0, -4], [30, 4], [60, -4]]) }
        ),
        shapeLayer(
          5,
          'flask-body',
          [
            path([[19, 8.5], [29, 8.5], [28.5, 11.2], [28.5, 18.8], [38, 35], [35, 39.8], [13, 39.8], [10, 35], [19.5, 18.8], [19.5, 11.2]]),
            fill('#D1FAE5', 65),
            stroke('#059669', 2.2),
            tr(),
          ],
          { r: anim1D([[0, -3], [30, 3], [60, -3]]) }
        ),
      ]);

    case 'maths':
      return doc('maths-protractor', [
        shapeLayer(
          1,
          'needle',
          [
            path([[24, 34.5], [24, 15.5]], undefined, undefined, false),
            stroke('#F59E0B', 2.5),
            tr(),
          ],
          {
            p: sVec([24, 34.5, 0]),
            a: sVec([24, 34.5, 0]),
            r: anim1D([[0, 32], [30, -35], [60, 32]]),
          }
        ),
        shapeLayer(2, 'pivot', [ellipse(24, 34.5, 5.8, 5.8), fill('#B45309'), stroke('#FEF3C7', 1), tr()]),
        shapeLayer(3, 'protractor-arc', [
          path(
            [[6.5, 34.5], [24, 17], [41.5, 34.5]],
            [[0, 0], [-9.6, 0], [0, -9.6]],
            [[0, -9.6], [9.6, 0], [0, 0]],
            true
          ),
          fill('#FEF3C7', 90),
          stroke('#D97706', 2.2),
          tr(),
        ]),
      ]);

    case 'biology':
      return doc('biology-dna', [
        shapeLayer(
          1,
          'rungs',
          [
            path([[17, 11.5], [31, 11.5]], undefined, undefined, false),
            stroke('#FB7185', 2.2),
            tr(),
          ],
          { s: anim2D([[0, [100, 100]], [30, [35, 100]], [60, [100, 100]]]) }
        ),
        shapeLayer(
          2,
          'rungs-mid',
          [
            path([[17.5, 30.8], [30.5, 30.8]], undefined, undefined, false),
            stroke('#F472B6', 2.2),
            tr(),
          ],
          { s: anim2D([[0, [35, 100]], [30, [100, 100]], [60, [35, 100]]]) }
        ),
        shapeLayer(
          3,
          'strand-1',
          [
            path(
              [[16, 7.5], [32, 24], [16, 40.5]],
              [[0, 0], [0, -7], [0, 0]],
              [[0, 7], [0, 7], [0, 0]],
              false
            ),
            stroke('#EC4899', 2.8),
            tr(),
          ],
          {
            s: anim2D([[0, [100, 100]], [30, [65, 104]], [60, [100, 100]]]),
            r: anim1D([[0, -4], [30, 4], [60, -4]]),
          }
        ),
        shapeLayer(
          4,
          'strand-2',
          [
            path(
              [[32, 7.5], [16, 24], [32, 40.5]],
              [[0, 0], [0, -7], [0, 0]],
              [[0, 7], [0, 7], [0, 0]],
              false
            ),
            stroke('#D946EF', 2.8),
            tr(),
          ],
          {
            s: anim2D([[0, [65, 104]], [30, [100, 100]], [60, [65, 104]]]),
            r: anim1D([[0, 4], [30, -4], [60, 4]]),
          }
        ),
      ]);

    case 'coding':
      return doc('coding-terminal', [
        shapeLayer(
          1,
          'cursor',
          [rect(28.5, 29, 6, 2.5, 1), fill('#0EA5E9'), tr()],
          { o: anim1D([[0, 100], [28, 100], [30, 10], [58, 10], [60, 100]]) }
        ),
        shapeLayer(
          2,
          'chevron',
          [
            path([[15, 23], [20.5, 27.5], [15, 32]], undefined, undefined, false),
            stroke('#2563EB', 2.5),
            tr(),
          ],
          { p: anim2D([[0, [24, 24]], [30, [26.5, 24]], [60, [24, 24]]]) }
        ),
        shapeLayer(
          3,
          'window',
          [
            rect(24, 24, 33, 27, 6),
            fill('#DBEAFE', 85),
            stroke('#2563EB', 2.2),
            tr(),
          ],
          { s: anim2D([[0, [100, 100]], [30, [104, 104]], [60, [100, 100]]]) }
        ),
      ]);

    case 'history':
      return doc('history-scroll', [
        shapeLayer(
          1,
          'seal',
          [ellipse(31.5, 30.5, 6.4, 6.4), fill('#B45309'), tr()],
          { s: anim2D([[0, [100, 100]], [30, [128, 128]], [60, [100, 100]]]) }
        ),
        shapeLayer(
          2,
          'lines',
          [
            path([[15.5, 18], [30.5, 18]], undefined, undefined, false),
            stroke('#D97706', 2),
            tr(),
          ],
          { s: anim2D([[0, [100, 100]], [30, [70, 100]], [60, [100, 100]]]) }
        ),
        shapeLayer(
          3,
          'lines-2',
          [
            path([[15.5, 24], [30.5, 24]], undefined, undefined, false),
            stroke('#D97706', 2),
            tr(),
          ],
          { s: anim2D([[0, [75, 100]], [30, [100, 100]], [60, [75, 100]]]) }
        ),
        shapeLayer(
          4,
          'parchment',
          [
            rect(23, 24, 28, 27, 4),
            fill('#FEF3C7'),
            stroke('#B45309', 2.1),
            tr(),
          ],
          { r: anim1D([[0, -3], [30, 3], [60, -3]]) }
        ),
      ]);

    case 'geography':
      return doc('geography-globe', [
        shapeLayer(
          1,
          'meridian',
          [ellipse(24, 24, 16, 31), stroke('#0284C7', 1.7, 85), tr()],
          { s: anim2D([[0, [100, 100]], [30, [20, 100]], [60, [100, 100]]]) }
        ),
        shapeLayer(2, 'equator', [
          path([[9, 24], [39, 24]], undefined, undefined, false),
          stroke('#0284C7', 1.5, 70),
          tr(),
        ]),
        shapeLayer(
          3,
          'land',
          [
            ellipse(17.5, 21, 7.5, 8.5),
            fill('#10B981', 85),
            tr(),
          ],
          { p: anim2D([[0, [22, 24]], [30, [27, 24]], [60, [22, 24]]]) }
        ),
        shapeLayer(
          4,
          'sphere',
          [
            ellipse(24, 24, 31, 31),
            fill('#BAE6FD', 85),
            stroke('#0284C7', 2.1),
            tr(),
          ],
          { r: anim1D([[0, -5], [30, 5], [60, -5]]) }
        ),
      ]);

    case 'english':
    case 'general':
    default:
      return doc('general-book', [
        shapeLayer(
          1,
          'page-flip',
          [
            path([[24, 15], [34, 13.5], [34, 33.5], [24, 36.5]]),
            fill('#CBD5E1', 85),
            stroke('#334155', 1.6),
            tr(),
          ],
          { s: anim2D([[0, [100, 100]], [30, [18, 100]], [60, [100, 100]]]) }
        ),
        shapeLayer(2, 'book-lines', [
          path([[13.5, 20], [19.5, 20.8]], undefined, undefined, false),
          stroke('#64748B', 1.6),
          tr(),
        ]),
        shapeLayer(3, 'book-spine', [
          path([[24, 14.5], [24, 37.2]], undefined, undefined, false),
          stroke('#1E293B', 2.2),
          tr(),
        ]),
        shapeLayer(
          4,
          'book-cover',
          [
            path([[24, 14.5], [9.5, 12.6], [9.5, 35.2], [24, 37.2], [38.5, 35.2], [38.5, 12.6]]),
            fill('#E2E8F0'),
            stroke('#1E293B', 2.2),
            tr(),
          ],
          { s: anim2D([[0, [100, 100]], [30, [103, 103]], [60, [100, 100]]]) }
        ),
      ]);
  }
};

export const getStudentNavLottieData = (name: NavLottieName, primaryHex = '#00A896') => {
  const accentHex = primaryHex;

  switch (name) {
    case 'dashboard':
      return doc('nav-dashboard', [
        shapeLayer(
          1,
          'tile-tl',
          [rect(16, 16, 11, 11, 2.5), stroke(accentHex, 2.4), tr()],
          { s: anim2D([[0, [92, 92]], [20, [115, 115]], [40, [92, 92]], [60, [92, 92]]]) }
        ),
        shapeLayer(
          2,
          'tile-tr',
          [rect(32, 16, 11, 11, 2.5), stroke(accentHex, 2.4), tr()],
          { s: anim2D([[0, [92, 92]], [15, [92, 92]], [35, [115, 115]], [55, [92, 92]], [60, [92, 92]]]) }
        ),
        shapeLayer(
          3,
          'tile-bl',
          [rect(16, 32, 11, 11, 2.5), stroke(accentHex, 2.4), tr()],
          { s: anim2D([[0, [110, 110]], [30, [90, 90]], [60, [110, 110]]]) }
        ),
        shapeLayer(
          4,
          'tile-br',
          [rect(32, 32, 11, 11, 2.5), stroke(accentHex, 2.4), tr()],
          { s: anim2D([[0, [90, 90]], [30, [112, 112]], [60, [90, 90]]]) }
        ),
      ]);

    case 'formulas':
      return doc('nav-formulas', [
        shapeLayer(
          1,
          'curve',
          [
            path(
              [[9, 31], [19, 16], [29, 32], [39, 17]],
              [[0, 0], [-4, 0], [-4, 0], [0, 0]],
              [[0, 0], [4, 0], [4, 0], [0, 0]],
              false
            ),
            stroke(accentHex, 2.5),
            tr(),
          ],
          { s: anim2D([[0, [100, 100]], [30, [108, 86]], [60, [100, 100]]]) }
        ),
        shapeLayer(
          2,
          'node',
          [ellipse(19, 16, 5.4, 5.4), fill(accentHex), tr()],
          {
            p: anim2D([[0, [24, 24]], [30, [34, 28]], [60, [24, 24]]]),
            s: anim2D([[0, [95, 95]], [30, [135, 135]], [60, [95, 95]]]),
          }
        ),
      ]);

    case 'passport':
      return doc('nav-passport', [
        shapeLayer(
          1,
          'page',
          [path([[24, 15], [35, 13], [35, 34], [24, 37]]), stroke(accentHex, 2.2), tr()],
          { s: anim2D([[0, [100, 100]], [30, [22, 100]], [60, [100, 100]]]) }
        ),
        shapeLayer(
          2,
          'cover',
          [
            path([[24, 15], [10, 13], [10, 34], [24, 37], [38, 34], [38, 13]]),
            stroke(accentHex, 2.4),
            tr(),
          ],
          { s: anim2D([[0, [100, 100]], [30, [105, 103]], [60, [100, 100]]]) }
        ),
      ]);

    case 'grades':
    case 'barchart':
      return doc('nav-grades', [
        shapeLayer(
          1,
          'bar-1',
          [rect(13, 31, 5.5, 13, 1.5), fill(accentHex), tr()],
          {
            p: sVec([13, 37, 0]),
            a: sVec([13, 37, 0]),
            s: anim2D([[0, [100, 65]], [30, [100, 115]], [60, [100, 65]]]),
          }
        ),
        shapeLayer(
          2,
          'bar-2',
          [rect(24, 24, 5.5, 27, 1.5), fill(accentHex), tr()],
          {
            p: sVec([24, 37, 0]),
            a: sVec([24, 37, 0]),
            s: anim2D([[0, [100, 105]], [30, [100, 68]], [60, [100, 105]]]),
          }
        ),
        shapeLayer(
          3,
          'bar-3',
          [rect(35, 27, 5.5, 21, 1.5), fill(accentHex), tr()],
          {
            p: sVec([35, 37, 0]),
            a: sVec([35, 37, 0]),
            s: anim2D([[0, [100, 78]], [30, [100, 118]], [60, [100, 78]]]),
          }
        ),
      ]);

    case 'quiz':
      return doc('nav-quiz', [
        shapeLayer(
          1,
          'check',
          [path([[17, 24.5], [22, 29.5], [32, 19]], undefined, undefined, false), stroke(accentHex, 2.6), tr()],
          { s: anim2D([[0, [90, 90]], [30, [120, 120]], [60, [90, 90]]]) }
        ),
        shapeLayer(
          2,
          'ring',
          [ellipse(24, 24, 30, 30), stroke(accentHex, 2.3, 100, true), tr()],
          { r: anim1D([[0, 0], [60, 360]]) }
        ),
      ]);

    case 'sparkles':
      return doc('nav-sparkles', [
        shapeLayer(
          1,
          'star-main',
          [
            path([[24, 9], [27.8, 20.2], [39, 24], [27.8, 27.8], [24, 39], [20.2, 27.8], [9, 24], [20.2, 20.2]]),
            stroke(accentHex, 2.2),
            tr(),
          ],
          {
            r: anim1D([[0, 0], [30, 45], [60, 0]]),
            s: anim2D([[0, [90, 90]], [30, [112, 112]], [60, [90, 90]]]),
          }
        ),
        shapeLayer(
          2,
          'star-mini',
          [ellipse(36.5, 11.5, 4.8, 4.8), fill(accentHex), tr()],
          {
            o: anim1D([[0, 30], [30, 100], [60, 30]]),
            s: anim2D([[0, [80, 80]], [30, [125, 125]], [60, [80, 80]]]),
          }
        ),
      ]);

    case 'award':
      return doc('nav-award', [
        shapeLayer(
          1,
          'medal',
          [ellipse(24, 18.5, 19, 19), stroke(accentHex, 2.4), tr()],
          { s: anim2D([[0, [94, 94]], [30, [114, 114]], [60, [94, 94]]]) }
        ),
        shapeLayer(
          2,
          'ribbon',
          [
            path([[18, 26.5], [16, 39], [24, 34.5], [32, 39], [30, 26.5]], undefined, undefined, false),
            stroke(accentHex, 2.3),
            tr(),
          ],
          { r: anim1D([[0, -6], [30, 6], [60, -6]]) }
        ),
      ]);

    case 'community':
      return doc('nav-community', [
        shapeLayer(
          1,
          'peer-left',
          [ellipse(18, 17.5, 9, 9), stroke(accentHex, 2.3), tr()],
          { p: anim2D([[0, [24, 24]], [30, [24, 20.5]], [60, [24, 24]]]) }
        ),
        shapeLayer(
          2,
          'peer-right',
          [ellipse(31.5, 19.5, 7, 7), stroke(accentHex, 2.1, 85), tr()],
          { p: anim2D([[0, [24, 20.5]], [30, [24, 24]], [60, [24, 20.5]]]) }
        ),
        shapeLayer(
          3,
          'shoulders',
          [
            path([[10, 36.5], [13.5, 29], [22.5, 29], [26, 36.5]], undefined, undefined, false),
            stroke(accentHex, 2.3),
            tr(),
          ],
          { p: anim2D([[0, [24, 24]], [30, [24, 22]], [60, [24, 24]]]) }
        ),
        shapeLayer(
          4,
          'shoulders-2',
          [
            path([[28, 36.5], [31, 30.5], [37.5, 30.5], [39.5, 36.5]], undefined, undefined, false),
            stroke(accentHex, 2.1, 85),
            tr(),
          ],
          { p: anim2D([[0, [24, 22]], [30, [24, 24]], [60, [24, 22]]]) }
        ),
      ]);

    case 'flame':
      return doc('nav-flame', [
        shapeLayer(
          1,
          'inner-flame',
          [ellipse(24, 30, 8.5, 11.5), fill('#FEF3C7'), tr()],
          { s: anim2D([[0, [100, 100]], [30, [115, 118]], [60, [100, 100]]]) }
        ),
        shapeLayer(
          2,
          'outer-flame',
          [
            path(
              [[24, 7.5], [35.5, 25], [31.5, 38], [16.5, 38], [12.5, 25]],
              [[0, 0], [0, -7], [5, 0], [-5, 0], [0, 7]],
              [[6, 7], [0, 7], [-5, 0], [0, -7], [4, -7]],
              true
            ),
            fill('#F59E0B'),
            tr(),
          ],
          {
            p: sVec([24, 38, 0]),
            a: sVec([24, 38, 0]),
            s: anim2D([[0, [100, 100]], [30, [106, 110]], [60, [100, 100]]]),
          }
        ),
      ]);

    case 'timer':
      return doc('nav-timer', [
        shapeLayer(
          1,
          'crown',
          [path([[20.5, 9], [27.5, 9]], undefined, undefined, false), stroke(accentHex, 2.6), tr()],
          { p: anim2D([[0, [24, 24]], [30, [24, 25.5]], [60, [24, 24]]]) }
        ),
        shapeLayer(
          2,
          'hand',
          [path([[24, 25.5], [24, 15.5]], undefined, undefined, false), stroke(accentHex, 2.4), tr()],
          {
            p: sVec([24, 25.5, 0]),
            a: sVec([24, 25.5, 0]),
            r: anim1D([[0, 0], [60, 360]]),
          }
        ),
        shapeLayer(
          3,
          'dial',
          [ellipse(24, 25.5, 25, 25), stroke(accentHex, 2.3), tr()],
          { s: anim2D([[0, [98, 98]], [30, [104, 104]], [60, [98, 98]]]) }
        ),
      ]);

    case 'zap':
    default:
      return doc('nav-zap', [
        shapeLayer(
          1,
          'bolt',
          [
            path([[27, 8], [13, 26], [23, 26], [21, 40], [35, 21.5], [25.5, 21.5]]),
            fill(accentHex),
            tr(),
          ],
          {
            s: anim2D([[0, [100, 100]], [30, [112, 112]], [60, [100, 100]]]),
            r: anim1D([[0, -4], [30, 5], [60, -4]]),
          }
        ),
      ]);
  }
};
