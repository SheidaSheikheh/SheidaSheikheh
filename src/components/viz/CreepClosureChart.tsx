import { useState } from 'react';
import { useResizeObserver, useAnimationLoop } from './_shared/hooks';
import { SegmentedControl, Slider, PlayButton, StatGrid, Legend } from './_shared/controls';

type Rock = 'salt' | 'trona';

const PARAMS: Record<Rock, { base: number; n: number; color: string; label: string }> = {
  salt: { base: 0.06, n: 4.5, color: 'var(--viz-c1)', label: 'Salt' },
  trona: { base: 0.16, n: 4.0, color: 'var(--viz-c2)', label: 'Trona' },
};

const MAX_T = 30; // years
const MAX_C = 50; // % closure
const H = 300;

const rate = (rock: Rock, ds: number, T: number) => {
  const p = PARAMS[rock];
  return p.base * Math.pow(ds / 12, p.n) * Math.exp(0.04 * (T - 45));
};
const closure = (rock: Rock, ds: number, T: number, t: number) =>
  Math.min(MAX_C, rate(rock, ds, T) * t * (1 + 0.015 * t));

export default function CreepClosureChart() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [rock, setRock] = useState<Rock>('salt');
  const [ds, setDs] = useState(14);
  const [temp, setTemp] = useState(50);
  const [p, setP] = useState(MAX_T);
  const [playing, setPlaying] = useState(false);

  useAnimationLoop((dt) => {
    setP((prev) => {
      const next = prev + (dt / 1000) * 6; // ~5s per 30yr
      return next >= MAX_T ? 0 : next;
    });
  }, playing);

  const w = width || 0;
  const padL = 42;
  const padR = 14;
  const padT = 12;
  const padB = 34;
  const plotW = Math.max(40, w - padL - padR);
  const plotH = H - padT - padB;
  const x = (t: number) => padL + (t / MAX_T) * plotW;
  const y = (c: number) => padT + (1 - c / MAX_C) * plotH;

  const other: Rock = rock === 'salt' ? 'trona' : 'salt';
  const curve = (r: Rock, tEnd: number) => {
    const steps = 60;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tEnd;
      pts.push(`${x(t)},${y(closure(r, ds, temp, t))}`);
    }
    return pts.join(' ');
  };

  const cNow = closure(rock, ds, temp, p);

  return (
    <div className="viz">
      <div className="viz-controls">
        <SegmentedControl<Rock>
          label="Host rock"
          value={rock}
          onChange={setRock}
          options={[
            { value: 'salt', label: 'Salt' },
            { value: 'trona', label: 'Trona' },
          ]}
        />
        <Slider label="Differential stress" min={5} max={25} step={1} value={ds} onChange={setDs} format={(v) => `${v} MPa`} />
        <Slider label="Temperature" min={30} max={90} step={5} value={temp} onChange={setTemp} format={(v) => `${v} °C`} />
        <PlayButton playing={playing} onToggle={() => setPlaying((s) => !s)} onReset={() => { setPlaying(false); setP(MAX_T); }} playLabel="Animate" pauseLabel="Pause" />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Cavern creep closure over time">
            {[0, 10, 20, 30, 40, 50].map((c) => (
              <g key={c}>
                <line x1={padL} x2={w - padR} y1={y(c)} y2={y(c)} className="viz-grid-line" />
                <text x={padL - 6} y={y(c) + 4} textAnchor="end" className="viz-tick">{c}</text>
              </g>
            ))}
            {[0, 10, 20, 30].map((t) => (
              <text key={t} x={x(t)} y={H - padB + 16} textAnchor="middle" className="viz-tick">{t}</text>
            ))}
            <text x={padL + plotW / 2} y={H - 3} textAnchor="middle" className="viz-axis-title">Time (years)</text>
            <text x={10} y={padT + plotH / 2} className="viz-axis-title" transform={`rotate(-90 10 ${padT + plotH / 2})`} textAnchor="middle">Cavern closure (%)</text>

            {/* comparison rock (faint, full) */}
            <polyline points={curve(other, MAX_T)} fill="none" stroke={PARAMS[other].color} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.5} />
            {/* active rock up to p */}
            <polyline points={curve(rock, p)} fill="none" stroke={PARAMS[rock].color} strokeWidth={2.75} />
            <circle cx={x(p)} cy={y(cNow)} r={5} fill={PARAMS[rock].color} stroke="var(--bg)" strokeWidth={1.5} />
          </svg>
        )}
      </div>

      <Legend
        items={[
          { color: PARAMS[rock].color, label: `${PARAMS[rock].label} (selected)`, line: true },
          { color: PARAMS[other].color, label: `${PARAMS[other].label} (compare)`, line: true },
        ]}
      />
      <StatGrid
        items={[
          { label: 'Year', value: p.toFixed(0) },
          { label: 'Closure', value: cNow.toFixed(1), unit: '%' },
          { label: 'Closure rate', value: rate(rock, ds, temp).toFixed(2), unit: '%/yr' },
        ]}
      />
      <p className="viz-note">
        Salt and trona flow like extremely slow fluids — they creep. Closure
        accelerates sharply with differential stress and temperature (a power-law,
        Arrhenius response), and trona creeps faster than salt. Keeping cavern
        pressure up is what holds this creep in check. Curves are illustrative.
      </p>
    </div>
  );
}
