import { useState } from 'react';
import { useResizeObserver } from './_shared/hooks';
import { Toggle, Legend } from './_shared/controls';

interface Axis {
  key: string;
  salt: number;
  trona: number;
}

// Illustrative 0–1 scores synthesising the literature on each host rock.
const AXES: Axis[] = [
  { key: 'Solubility', salt: 0.7, trona: 0.88 },
  { key: 'Mechanical strength', salt: 0.82, trona: 0.55 },
  { key: 'Depth range', salt: 0.85, trona: 0.45 },
  { key: 'Gas tightness', salt: 0.9, trona: 0.62 },
  { key: 'Creep resistance', salt: 0.75, trona: 0.5 },
  { key: 'Wyoming availability', salt: 0.6, trona: 0.95 },
  { key: 'Technology maturity', salt: 0.95, trona: 0.35 },
];

const SALT = 'var(--viz-c1)';
const TRONA = 'var(--viz-c2)';
const H = 380;

export default function SaltVsTronaCompare() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [showSalt, setShowSalt] = useState(true);
  const [showTrona, setShowTrona] = useState(true);
  const [hover, setHover] = useState<number | null>(null);

  const w = width || 0;
  const cx = w / 2;
  const cy = H / 2 + 4;
  const R = Math.max(60, Math.min(w, H) / 2 - 74);
  const n = AXES.length;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, v: number): [number, number] => [
    cx + R * v * Math.cos(angle(i)),
    cy + R * v * Math.sin(angle(i)),
  ];
  const poly = (key: 'salt' | 'trona') =>
    AXES.map((a, i) => point(i, a[key]).join(',')).join(' ');

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="viz">
      <div className="viz-controls">
        <Toggle label="Salt" checked={showSalt} onChange={setShowSalt} />
        <Toggle label="Trona" checked={showTrona} onChange={setShowTrona} />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg
            className="viz-svg"
            width={w}
            height={H}
            viewBox={`0 0 ${w} ${H}`}
            role="img"
            aria-label="Radar comparison of salt and trona as hydrogen-cavern host rock"
          >
            {/* rings */}
            {rings.map((r) => (
              <polygon
                key={r}
                points={AXES.map((_, i) => point(i, r).join(',')).join(' ')}
                fill="none"
                className="viz-grid-line"
                style={{ strokeDasharray: 'none' }}
                stroke="var(--viz-grid)"
              />
            ))}
            {/* spokes + labels */}
            {AXES.map((a, i) => {
              const [ex, ey] = point(i, 1);
              const [lx, ly] = point(i, 1.16);
              const ca = Math.cos(angle(i));
              const anchor = ca > 0.25 ? 'start' : ca < -0.25 ? 'end' : 'middle';
              const active = hover === i;
              return (
                <g
                  key={a.key}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'default' }}
                >
                  <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--viz-grid)" />
                  <text
                    x={lx}
                    y={ly + 4}
                    textAnchor={anchor}
                    className="viz-tick"
                    style={{ fontWeight: active ? 700 : 500, fontSize: 11.5 }}
                  >
                    {a.key}
                  </text>
                  {active && (
                    <text x={lx} y={ly + 18} textAnchor={anchor} className="viz-tick" style={{ fontSize: 10.5 }}>
                      {showSalt && (
                        <tspan fill={SALT}>S {Math.round(a.salt * 100)}</tspan>
                      )}
                      {showSalt && showTrona && '  '}
                      {showTrona && (
                        <tspan fill={TRONA}>T {Math.round(a.trona * 100)}</tspan>
                      )}
                    </text>
                  )}
                </g>
              );
            })}

            {showSalt && (
              <polygon points={poly('salt')} fill={SALT} fillOpacity={0.18} stroke={SALT} strokeWidth={2} />
            )}
            {showTrona && (
              <polygon points={poly('trona')} fill={TRONA} fillOpacity={0.18} stroke={TRONA} strokeWidth={2} />
            )}
            {showSalt &&
              AXES.map((a, i) => {
                const [px, py] = point(i, a.salt);
                return <circle key={`s${i}`} cx={px} cy={py} r={3} fill={SALT} />;
              })}
            {showTrona &&
              AXES.map((a, i) => {
                const [px, py] = point(i, a.trona);
                return <circle key={`t${i}`} cx={px} cy={py} r={3} fill={TRONA} />;
              })}
          </svg>
        )}
      </div>

      <Legend
        items={[
          { color: SALT, label: 'Salt (halite)' },
          { color: TRONA, label: 'Trona' },
        ]}
      />
      <p className="viz-note">
        Qualitative 0–100 scores, larger is more favourable for that property.
        Hover an axis for values. Salt leads on maturity and gas-tightness; trona
        wins on regional abundance in Wyoming.
      </p>
    </div>
  );
}
