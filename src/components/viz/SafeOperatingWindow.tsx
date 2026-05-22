import { useState } from 'react';
import { useResizeObserver } from './_shared/hooks';
import { Slider, StatGrid } from './_shared/controls';

const LITHO = 0.0226;
const DEPTH = 1000;
const H = 300;

type State = 'low' | 'safe' | 'high';

export default function SafeOperatingWindow() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [pct, setPct] = useState(55);

  const w = width || 0;
  const litho = LITHO * DEPTH;
  const op = (pct / 100) * litho;

  const state: State = pct < 30 ? 'low' : pct > 80 ? 'high' : 'safe';
  const info = {
    low: { color: 'var(--viz-stress)', title: 'Creep closure', text: 'Pressure is too low to support the walls — the rock slowly squeezes the cavern shut and shear failure becomes likely.' },
    safe: { color: 'var(--viz-good)', title: 'Stable operation', text: 'Pressure balances the rock load. The cavern holds its shape and stays gas-tight through cycling.' },
    high: { color: 'var(--viz-stress)', title: 'Fracturing risk', text: 'Pressure approaches the rock strength — tensile fractures can open and the caprock seal may be breached.' },
  }[state];

  // gauge geometry
  const gx = 42;
  const gTop = 28;
  const gBot = H - 40;
  const gY = (v: number) => gBot - (v / 100) * (gBot - gTop);

  // cavern geometry
  const cx = gx + (w - gx) * 0.55;
  const cy = (gTop + gBot) / 2;
  const r = 46;
  const squeeze = state === 'low' ? 1 - (30 - pct) / 100 : 1; // shrink when low

  return (
    <div className="viz">
      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Safe operating pressure window with failure modes">
            {/* gauge */}
            <rect x={gx - 14} y={gY(100)} width={28} height={gY(80) - gY(100)} fill="var(--viz-stress)" opacity={0.85} rx={4} />
            <rect x={gx - 14} y={gY(80)} width={28} height={gY(30) - gY(80)} fill="var(--viz-good)" opacity={0.85} />
            <rect x={gx - 14} y={gY(30)} width={28} height={gY(0) - gY(30)} fill="var(--viz-stress)" opacity={0.85} rx={4} />
            <text x={gx} y={gTop - 8} textAnchor="middle" className="viz-tick">% litho</text>
            {[0, 30, 80, 100].map((v) => (
              <text key={v} x={gx + 20} y={gY(v) + 4} className="viz-tick" style={{ fontSize: 10 }}>{v}</text>
            ))}
            {/* handle */}
            <g style={{ transition: 'all 0.2s' }}>
              <line x1={gx - 18} x2={gx + 18} y1={gY(pct)} y2={gY(pct)} stroke="var(--fg)" strokeWidth={3} />
              <circle cx={gx} cy={gY(pct)} r={6} fill="var(--fg)" />
            </g>

            {/* caprock */}
            <rect x={cx - 110} y={cy - r - 46} width={220} height={20} fill="var(--viz-caprock)" opacity={0.6} />
            <text x={cx + 110} y={cy - r - 50} textAnchor="end" className="viz-tick">caprock</text>

            {/* cavern */}
            <circle cx={cx} cy={cy} r={r * squeeze} fill="var(--viz-cavern)" stroke={info.color} strokeWidth={2.5} strokeDasharray={state === 'low' ? '6 4' : 'none'} />

            {/* low: inward creep arrows */}
            {state === 'low' &&
              Array.from({ length: 8 }, (_, i) => {
                const th = (i * Math.PI) / 4;
                const c = Math.cos(th);
                const s = Math.sin(th);
                const x1 = cx + (r + 22) * c;
                const y1 = cy - (r + 22) * s;
                const x2 = cx + (r * squeeze + 6) * c;
                const y2 = cy - (r * squeeze + 6) * s;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--viz-stress)" strokeWidth={2.5} markerEnd="" />;
              })}
            {/* high: radial cracks */}
            {state === 'high' &&
              Array.from({ length: 7 }, (_, i) => {
                const th = (i * 2 * Math.PI) / 7 + 0.3;
                const c = Math.cos(th);
                const s = Math.sin(th);
                const len = 18 + ((pct - 80) / 20) * 26;
                const x1 = cx + r * c;
                const y1 = cy - r * s;
                const x2 = cx + (r + len) * c;
                const y2 = cy - (r + len) * s;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--viz-stress)" strokeWidth={2} />;
              })}
            <text x={cx} y={cy + r + 28} textAnchor="middle" className="viz-tick" style={{ fill: info.color, fontWeight: 700 }}>{info.title}</text>
          </svg>
        )}
      </div>

      <div className="viz-controls">
        <Slider label="Operating pressure" min={0} max={100} step={1} value={pct} onChange={setPct} format={(v) => `${v}% litho`} />
      </div>

      <div className="surface" style={{ padding: '0.85rem 1rem', borderLeft: `3px solid ${info.color}` }} aria-live="polite">
        <strong style={{ display: 'block', marginBottom: '0.2rem', color: info.color }}>{info.title}</strong>
        <span style={{ color: 'var(--fg-muted)', fontSize: '0.92rem' }}>{info.text}</span>
      </div>

      <StatGrid
        items={[
          { label: 'Depth', value: String(DEPTH), unit: 'm' },
          { label: 'Lithostatic', value: litho.toFixed(1), unit: 'MPa' },
          { label: 'Operating', value: op.toFixed(1), unit: 'MPa' },
        ]}
      />
      <p className="viz-note">
        Drag the pressure between the limits. The whole job of cavern design is
        staying in the green: high enough to resist creep, low enough to avoid
        fracturing. Depth fixed at {DEPTH} m for illustration.
      </p>
    </div>
  );
}
