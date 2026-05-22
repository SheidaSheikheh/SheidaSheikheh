import { scaleLog } from 'd3-scale';
import { useResizeObserver } from './_shared/hooks';

interface Store {
  name: string;
  gwh: number;
  underground: boolean;
}

// Illustrative energy stored per site (GWh of hydrogen), log-distributed.
const STORES: Store[] = [
  { name: 'Above-ground tank', gwh: 0.1, underground: false },
  { name: 'Pipeline linepack', gwh: 1, underground: false },
  { name: 'Lined rock cavern', gwh: 30, underground: true },
  { name: 'Salt cavern', gwh: 150, underground: true },
  { name: 'Depleted reservoir', gwh: 5000, underground: true },
];

const H = 250;
const TICKS = [0.1, 1, 10, 100, 1000, 10000];

export default function CapacityVsFootprint() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const w = width || 0;

  const padL = 130;
  const padR = 16;
  const padT = 12;
  const padB = 34;
  const x = scaleLog().domain([0.1, 10000]).range([padL, w - padR]);
  const rowH = (H - padT - padB) / STORES.length;

  const fmt = (v: number) => (v >= 1 ? `${v.toLocaleString()}` : `${v}`);

  return (
    <div className="viz">
      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Energy stored per site by storage method, log scale">
            {/* grid + x ticks */}
            {TICKS.map((t) => (
              <g key={t}>
                <line x1={x(t)} x2={x(t)} y1={padT} y2={H - padB} className="viz-grid-line" />
                <text x={x(t)} y={H - padB + 16} textAnchor="middle" className="viz-tick">
                  {fmt(t)}
                </text>
              </g>
            ))}
            <text x={(padL + w - padR) / 2} y={H - 4} textAnchor="middle" className="viz-axis-title">
              Energy stored per site — GWh of H₂ (log scale)
            </text>

            {/* bars */}
            {STORES.map((s, i) => {
              const y = padT + i * rowH + rowH / 2;
              const x0 = x(0.1);
              const x1 = x(s.gwh);
              const color = s.underground ? 'var(--viz-c1)' : 'var(--viz-c4)';
              return (
                <g key={s.name}>
                  <text x={padL - 8} y={y + 4} textAnchor="end" className="viz-tick" style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {s.name}
                  </text>
                  <rect x={x0} y={y - rowH * 0.3} width={Math.max(0, x1 - x0)} height={rowH * 0.6} rx={4} fill={color} opacity={s.underground ? 0.95 : 0.7} />
                  <text x={x1 + 6} y={y + 4} className="viz-tick" style={{ fontSize: 12, fontWeight: 600 }}>
                    {fmt(s.gwh)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <div className="viz-legend">
        <span className="viz-legend-item"><span className="viz-swatch" style={{ background: 'var(--viz-c1)' }} /> Underground</span>
        <span className="viz-legend-item"><span className="viz-swatch" style={{ background: 'var(--viz-c4)' }} /> Above ground</span>
      </div>
      <p className="viz-note">
        A single salt cavern can hold a thousand times the hydrogen of a surface
        tank — from roughly the same surface footprint. Depleted reservoirs go
        further still. Values are order-of-magnitude illustrations.
      </p>
    </div>
  );
}
