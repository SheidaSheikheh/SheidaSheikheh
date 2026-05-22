import { useState } from 'react';
import { useResizeObserver, useAnimationLoop } from './_shared/hooks';
import { PlayButton, Slider, SpeedControl, StatGrid } from './_shared/controls';

const MAX_T = 50; // years
const H = 290;

export default function SubsidenceViz() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [t, setT] = useState(MAX_T);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useAnimationLoop((dt) => {
    setT((prev) => {
      const next = prev + (dt / 1000) * 12 * speed;
      return next >= MAX_T ? 0 : next;
    });
  }, playing);

  const w = width || 0;
  const surfaceY = 54;
  const cx = w / 2;
  const cavY = 196;
  const r0 = 44;

  const closureFrac = Math.min(0.6, t * 0.012);
  const r = r0 * (1 - closureFrac);
  const volLoss = (r0 * r0 - r * r) / (r0 * r0); // 0..~0.84
  const SmaxPx = volLoss * 40;
  const wbowl = Math.max(60, 0.22 * w);
  const bowl = (x: number) => SmaxPx * Math.exp(-Math.pow((x - cx) / wbowl, 2));

  // surface polyline
  const pts: string[] = [];
  if (w > 0) {
    for (let x = 0; x <= w; x += 8) pts.push(`${x},${surfaceY + bowl(x)}`);
  }
  const surfacePath = `M0,${H} L0,${surfaceY} L${pts.join(' L')} L${w},${H} Z`;
  const subsidenceCm = SmaxPx * 5; // illustrative scale

  return (
    <div className="viz">
      <div className="viz-controls">
        <PlayButton playing={playing} onToggle={() => setPlaying((s) => !s)} onReset={() => { setPlaying(false); setT(0); }} playLabel="Run years" pauseLabel="Pause" />
        <SpeedControl value={speed} onChange={setSpeed} />
        <Slider label="Time" min={0} max={MAX_T} step={1} value={t} onChange={(v) => { setPlaying(false); setT(v); }} format={(v) => `${v.toFixed(0)} yr`} />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Surface subsidence above a closing cavern">
            {/* sky */}
            <rect x={0} y={0} width={w} height={H} fill="var(--bg-sunken)" />
            {/* ground with subsidence bowl */}
            <path d={surfacePath} fill="var(--viz-overburden)" opacity={0.55} />
            {/* original surface reference */}
            <line x1={0} x2={w} y1={surfaceY} y2={surfaceY} stroke="var(--fg-faint)" strokeDasharray="3 4" opacity={0.6} />
            <text x={6} y={surfaceY - 6} className="viz-tick" style={{ fontSize: 10 }}>original surface</text>

            {/* host bed band */}
            <rect x={0} y={cavY - r0 - 14} width={w} height={2 * r0 + 28} fill="var(--viz-salt)" opacity={0.35} />

            {/* cavern, shrinking */}
            <ellipse cx={cx} cy={cavY} rx={r} ry={r} fill="var(--viz-cavern)" stroke="var(--fg-muted)" strokeWidth={1.5} />
            {closureFrac > 0.02 &&
              Array.from({ length: 6 }, (_, i) => {
                const th = (i * Math.PI) / 3;
                const c = Math.cos(th);
                const s = Math.sin(th);
                return <line key={i} x1={cx + (r + 14) * c} y1={cavY - (r + 14) * s} x2={cx + (r + 4) * c} y2={cavY - (r + 4) * s} stroke="var(--viz-stress)" strokeWidth={2} />;
              })}
            <text x={cx} y={cavY + r0 + 26} textAnchor="middle" className="viz-tick">cavern</text>
          </svg>
        )}
      </div>

      <StatGrid
        items={[
          { label: 'Time', value: t.toFixed(0), unit: 'yr' },
          { label: 'Cavern closure', value: (closureFrac * 100).toFixed(0), unit: '%' },
          { label: 'Max subsidence', value: subsidenceCm.toFixed(0), unit: 'cm' },
        ]}
      />
      <p className="viz-note">
        As a cavern slowly creeps closed, the ground above settles into a gentle
        subsidence bowl. Tracking it is one way operators monitor what's happening
        kilometres below. Magnitudes are illustrative.
      </p>
    </div>
  );
}
