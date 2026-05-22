import { useState } from 'react';
import { useResizeObserver } from './_shared/hooks';

interface Feature {
  id: string;
  name: string;
  x: number; // 0..1 within Wyoming box
  y: number;
  info: string;
  star?: boolean;
}

const FEATURES: Feature[] = [
  {
    id: 'rocksprings',
    name: 'Rock Springs / Green River',
    x: 0.2,
    y: 0.74,
    info: "Heart of Wyoming's trona mining district, where the thick evaporite beds of the basin are worked today.",
  },
  {
    id: 'laramie',
    name: 'Laramie',
    x: 0.86,
    y: 0.82,
    info: 'Home of the University of Wyoming — where this research on subsurface hydrogen storage is based.',
    star: true,
  },
  {
    id: 'cheyenne',
    name: 'Cheyenne',
    x: 0.94,
    y: 0.88,
    info: 'State capital, in the south-east corner — useful for orientation.',
  },
];

const BASIN = '0.05,0.54 0.31,0.49 0.39,0.66 0.32,0.9 0.09,0.93 0.015,0.72';

const DEFAULT_INFO = {
  name: 'Green River Basin',
  info: "The world's largest known trona deposit — vast bedded evaporites that supply most of the planet's soda ash. Those same beds are the focus of trona-cavern hydrogen-storage studies.",
};

export default function GreenRiverBasinMap() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [selected, setSelected] = useState<string>('basin');

  const w = width || 0;
  const pad = 14;
  const boxW = w - pad * 2;
  const boxH = Math.min(360, Math.max(180, boxW * 0.62));
  const H = boxH + pad * 2;

  const px = (nx: number) => pad + nx * boxW;
  const py = (ny: number) => pad + ny * boxH;
  const basinPts = BASIN.split(' ')
    .map((p) => {
      const [a, b] = p.split(',').map(Number);
      return `${px(a)},${py(b)}`;
    })
    .join(' ');

  const current =
    selected === 'basin'
      ? DEFAULT_INFO
      : FEATURES.find((f) => f.id === selected) ?? DEFAULT_INFO;

  return (
    <div className="viz">
      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg
            className="viz-svg"
            width={w}
            height={H}
            viewBox={`0 0 ${w} ${H}`}
            role="img"
            aria-label="Map of Wyoming highlighting the Green River Basin trona deposit"
          >
            {/* Wyoming (very nearly a rectangle) */}
            <rect
              x={pad}
              y={pad}
              width={boxW}
              height={boxH}
              rx={6}
              fill="var(--bg-sunken)"
              stroke="var(--border-strong)"
              strokeWidth={1.5}
            />
            <text x={px(0.5)} y={py(0.12)} textAnchor="middle" className="viz-tick" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em' }}>
              WYOMING
            </text>

            {/* Green River Basin */}
            <polygon
              points={basinPts}
              fill="var(--viz-trona)"
              fillOpacity={selected === 'basin' ? 0.95 : 0.7}
              stroke="var(--viz-c2)"
              strokeWidth={selected === 'basin' ? 2.5 : 1.5}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected('basin')}
            />
            <text x={px(0.18)} y={py(0.68)} textAnchor="middle" className="viz-tick" style={{ fontSize: 11, fontWeight: 600, pointerEvents: 'none' }}>
              Green River
            </text>
            <text x={px(0.18)} y={py(0.68) + 13} textAnchor="middle" className="viz-tick" style={{ fontSize: 11, fontWeight: 600, pointerEvents: 'none' }}>
              Basin
            </text>

            {/* cities */}
            {FEATURES.map((f) => {
              const active = selected === f.id;
              const r = active ? 7 : 5;
              return (
                <g
                  key={f.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(f.id)}
                >
                  {f.star ? (
                    <Star cx={px(f.x)} cy={py(f.y)} r={r + 1} active={active} />
                  ) : (
                    <circle
                      cx={px(f.x)}
                      cy={py(f.y)}
                      r={r}
                      fill={active ? 'var(--accent)' : 'var(--fg-muted)'}
                      stroke="var(--bg)"
                      strokeWidth={1.5}
                    />
                  )}
                  <text
                    x={px(f.x)}
                    y={py(f.y) - (active ? 12 : 10)}
                    textAnchor="middle"
                    className="viz-tick"
                    style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}
                  >
                    {f.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div
        className="surface"
        style={{ padding: '0.85rem 1rem', borderLeft: '3px solid var(--viz-c2)' }}
        aria-live="polite"
      >
        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{current.name}</strong>
        <span style={{ color: 'var(--fg-muted)', fontSize: '0.92rem' }}>{current.info}</span>
      </div>
      <p className="viz-note">Tap the basin or a city to learn more. Outline is schematic.</p>
    </div>
  );
}

function Star({ cx, cy, r, active }: { cx: number; cy: number; r: number; active: boolean }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`);
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={active ? 'var(--accent)' : 'var(--accent)'}
      stroke="var(--bg)"
      strokeWidth={1.2}
    />
  );
}
