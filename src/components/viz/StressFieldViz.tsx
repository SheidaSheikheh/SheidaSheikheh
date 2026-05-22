import { useState } from 'react';
import { useResizeObserver } from './_shared/hooks';
import { Slider, StatGrid, Legend } from './_shared/controls';

const LITHO = 0.0226; // MPa/m
const H = 360;

export default function StressFieldViz() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [depth, setDepth] = useState(1000);
  const [k, setK] = useState(0.6);

  const w = width || 0;
  const cx = w / 2;
  const cy = H / 2;
  const a = 44;

  const sv = LITHO * depth;
  const sh = k * sv;

  // Kirsch tangential stress at the boundary of a circular opening
  // (θ measured from the horizontal axis): σθ = (σh+σv) + 2(σv−σh)cos2θ
  const sigmaTheta = (theta: number) => sh + sv + 2 * (sv - sh) * Math.cos(2 * theta);

  const N = 36;
  const angles = Array.from({ length: N }, (_, i) => (i * 2 * Math.PI) / N);
  const vals = angles.map(sigmaTheta);
  const peak = Math.max(...vals.map(Math.abs), 1);
  const Lmax = 52;

  const springline = 3 * sv - sh; // θ = 0 (sides)
  const crown = 3 * sh - sv; // θ = 90° (top/bottom)

  const arrowScale = 40 / (LITHO * 2000); // px per MPa
  const svLen = sv * arrowScale;
  const shLen = sh * arrowScale;

  return (
    <div className="viz">
      <div className="viz-controls">
        <Slider label="Depth" min={300} max={2000} step={50} value={depth} onChange={setDepth} format={(v) => `${v} m`} />
        <Slider label="Stress ratio K = σh/σv" min={0.3} max={1} step={0.05} value={k} onChange={setK} format={(v) => v.toFixed(2)} />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="In-situ stress concentration around a circular cavern">
            {/* rock backdrop */}
            <rect x={cx - 150} y={cy - 150} width={300} height={300} rx={10} fill="var(--viz-overburden)" opacity={0.18} />

            {/* far-field stress arrows */}
            <Arrow x2={cx} y2={cy - a - 10} color="var(--viz-c2)" len={svLen} dir="down" />
            <Arrow x2={cx} y2={cy + a + 10} color="var(--viz-c2)" len={svLen} dir="up" />
            <Arrow x2={cx - a - 10} y2={cy} color="var(--viz-c3)" len={shLen} dir="right" />
            <Arrow x2={cx + a + 10} y2={cy} color="var(--viz-c3)" len={shLen} dir="left" />
            <text x={cx + 6} y={cy - 150 + 14} className="viz-tick" style={{ fill: 'var(--viz-c2)', fontWeight: 600 }}>σv</text>
            <text x={cx + 150 - 4} y={cy - 8} textAnchor="end" className="viz-tick" style={{ fill: 'var(--viz-c3)', fontWeight: 600 }}>σh</text>

            {/* cavern */}
            <circle cx={cx} cy={cy} r={a} fill="var(--viz-cavern)" stroke="var(--fg-muted)" strokeWidth={1.5} />

            {/* stress rose */}
            {angles.map((th, i) => {
              const s = vals[i];
              const L = (s / peak) * Lmax;
              const c = Math.cos(th);
              const sn = Math.sin(th);
              const x1 = cx + a * c;
              const y1 = cy - a * sn;
              const x2 = cx + (a + L) * c;
              const y2 = cy - (a + L) * sn;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={s >= 0 ? 'var(--accent)' : 'var(--viz-stress)'} strokeWidth={2.4} strokeLinecap="round" />
              );
            })}
          </svg>
        )}
      </div>

      <Legend
        items={[
          { color: 'var(--accent)', label: 'Compression (σθ > 0)', line: true },
          { color: 'var(--viz-stress)', label: 'Tension (σθ < 0)', line: true },
        ]}
      />
      <StatGrid
        items={[
          { label: 'σv (vertical)', value: sv.toFixed(1), unit: 'MPa' },
          { label: 'σh (horizontal)', value: sh.toFixed(1), unit: 'MPa' },
          { label: 'Peak at sides', value: springline.toFixed(1), unit: 'MPa' },
          { label: 'At crown', value: crown.toFixed(1), unit: crown < 0 ? 'MPa (tension!)' : 'MPa' },
        ]}
      />
      <p className="viz-note">
        Cutting a cavern concentrates stress. The classic result: compression peaks
        at the sides (≈ 3σv − σh) while the crown can swing into tension when the
        horizontal stress is low (K small) — the setting most prone to roof
        spalling. Based on the Kirsch solution for a circular opening.
      </p>
    </div>
  );
}

function Arrow({
  x2,
  y2,
  color,
  len,
  dir,
}: {
  x2: number;
  y2: number;
  color: string;
  len: number;
  dir: 'up' | 'down' | 'left' | 'right';
}) {
  // shaft starts `len` away from the target tip
  let sx = x2;
  let sy = y2;
  if (dir === 'down') sy = y2 - len;
  if (dir === 'up') sy = y2 + len;
  if (dir === 'right') sx = x2 - len;
  if (dir === 'left') sx = x2 + len;
  const head = 6;
  let hp = '';
  if (dir === 'down') hp = `${x2 - head},${y2 - head} ${x2 + head},${y2 - head} ${x2},${y2}`;
  if (dir === 'up') hp = `${x2 - head},${y2 + head} ${x2 + head},${y2 + head} ${x2},${y2}`;
  if (dir === 'right') hp = `${x2 - head},${y2 - head} ${x2 - head},${y2 + head} ${x2},${y2}`;
  if (dir === 'left') hp = `${x2 + head},${y2 - head} ${x2 + head},${y2 + head} ${x2},${y2}`;
  return (
    <g>
      <line x1={sx} y1={sy} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
      <polygon points={hp} fill={color} />
    </g>
  );
}
