import { useState } from 'react';
import { useResizeObserver, useAnimationLoop } from './_shared/hooks';
import { PlayButton, Slider, SpeedControl, StatGrid } from './_shared/controls';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NET = [-11, -8, -2, 5, 9, 11, 10, 8, 4, -5, -9, -12]; // net injection per month (sums to 0)
const BASE = 32;
const CUSHION = 8;

const cum: number[] = [];
{
  let s = 0;
  for (const n of NET) {
    s += n;
    cum.push(s);
  }
}
const INV = [BASE, ...cum.map((c) => BASE + c)]; // 13 points (month boundaries)
const MAX_INV = 60;
const MAX_NET = 14;

const invAt = (p: number) => {
  const i = Math.floor(p);
  if (i >= 12) return INV[12];
  return INV[i] + (INV[i + 1] - INV[i]) * (p - i);
};

const H = 300;

export default function SeasonalStorageChart() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [p, setP] = useState(12);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useAnimationLoop((dt) => {
    setP((prev) => {
      const next = prev + (dt / 750) * speed;
      return next >= 12 ? 0 : next;
    });
  }, playing);

  const w = width || 0;
  const padL = 40;
  const padR = 14;
  const plotW = Math.max(40, w - padL - padR);
  const x = (m: number) => padL + (m / 12) * plotW;

  const invTop = 12;
  const invH = 168;
  const invY = (v: number) => invTop + (1 - v / MAX_INV) * invH;
  const baseY = invTop + invH;

  const netTop = 200;
  const netH = 70;
  const netZero = netTop + netH / 2;
  const netY = (v: number) => netZero - (v / MAX_NET) * (netH / 2);

  const monthIdx = Math.min(11, Math.floor(p));
  const charging = NET[monthIdx] >= 0;
  const invNow = invAt(p);

  // inventory area up to p
  const segPts: string[] = [];
  const whole = Math.floor(p);
  for (let i = 0; i <= whole && i <= 12; i++) segPts.push(`${x(i)},${invY(INV[i])}`);
  if (p > whole && whole < 12) segPts.push(`${x(p)},${invY(invNow)}`);
  const areaPath =
    segPts.length > 0
      ? `M${x(0)},${baseY} L${segPts.join(' L')} L${x(Math.min(p, 12))},${baseY} Z`
      : '';
  const fullLine = INV.map((v, i) => `${x(i)},${invY(v)}`).join(' ');

  return (
    <div className="viz">
      <div className="viz-controls">
        <PlayButton
          playing={playing}
          onToggle={() => setPlaying((s) => !s)}
          onReset={() => {
            setPlaying(false);
            setP(0);
          }}
          playLabel="Play year"
          pauseLabel="Pause"
        />
        <SpeedControl value={speed} onChange={setSpeed} />
        <Slider
          label="Month"
          min={0}
          max={12}
          step={0.1}
          value={p}
          onChange={(v) => {
            setPlaying(false);
            setP(v);
          }}
          format={() => MONTHS[monthIdx]}
        />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Seasonal hydrogen storage inventory across a year">
            {/* inventory gridlines */}
            {[0, 20, 40, 60].map((v) => (
              <g key={v}>
                <line x1={padL} x2={w - padR} y1={invY(v)} y2={invY(v)} className="viz-grid-line" />
                <text x={padL - 6} y={invY(v) + 4} textAnchor="end" className="viz-tick">{v}</text>
              </g>
            ))}
            <text x={6} y={invY(MAX_INV / 2)} className="viz-axis-title" transform={`rotate(-90 8 ${invY(MAX_INV / 2)})`} textAnchor="middle">Inventory</text>

            {/* cushion gas line */}
            <line x1={padL} x2={w - padR} y1={invY(CUSHION)} y2={invY(CUSHION)} stroke="var(--viz-stress)" strokeDasharray="4 4" opacity={0.7} />
            <text x={w - padR} y={invY(CUSHION) - 4} textAnchor="end" className="viz-tick" style={{ fill: 'var(--viz-stress)' }}>cushion gas</text>

            {/* inventory full line (context) + filled area */}
            <polyline points={fullLine} fill="none" stroke="var(--viz-h2)" strokeWidth={1} opacity={0.3} />
            {areaPath && <path d={areaPath} fill="var(--viz-h2)" opacity={0.22} />}
            {areaPath && <polyline points={segPts.join(' ')} fill="none" stroke="var(--viz-h2)" strokeWidth={2.5} />}
            <circle cx={x(Math.min(p, 12))} cy={invY(invNow)} r={5} fill="var(--viz-h2)" stroke="var(--bg)" strokeWidth={1.5} />

            {/* net flow bars */}
            <line x1={padL} x2={w - padR} y1={netZero} y2={netZero} className="viz-axis-line" />
            {NET.map((v, i) => {
              const bx = x(i + 0.5);
              const bw = Math.max(6, (plotW / 12) * 0.55);
              const top = v >= 0 ? netY(v) : netZero;
              const hgt = Math.abs(netY(v) - netZero);
              const active = i === monthIdx;
              return (
                <g key={i}>
                  <rect x={bx - bw / 2} y={top} width={bw} height={hgt} rx={2} fill={v >= 0 ? 'var(--viz-good)' : 'var(--viz-stress)'} opacity={active ? 1 : 0.5} />
                </g>
              );
            })}
            <text x={padL} y={netTop - 2} className="viz-axis-title">Monthly flow: inject (+) / withdraw (−)</text>

            {/* month labels */}
            {MONTHS.map((m, i) => (
              <text key={m} x={x(i + 0.5)} y={H - 4} textAnchor="middle" className="viz-tick" style={{ fontWeight: i === monthIdx ? 700 : 400 }}>
                {m[0]}
              </text>
            ))}
          </svg>
        )}
      </div>

      <StatGrid
        items={[
          { label: 'Month', value: MONTHS[monthIdx] },
          { label: 'Inventory', value: invNow.toFixed(0), unit: 'units' },
          { label: 'Status', value: charging ? 'Charging' : 'Discharging' },
        ]}
      />
      <p className="viz-note">
        Surplus renewables charge the store through spring and summer; winter
        demand draws it back down. The cushion gas stays put — only the working
        gas above it is cycled. Flows are illustrative.
      </p>
    </div>
  );
}
