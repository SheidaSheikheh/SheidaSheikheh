import { useState } from 'react';
import { useResizeObserver, useAnimationLoop } from './_shared/hooks';
import { SegmentedControl, Slider, PlayButton, SpeedControl, StatGrid } from './_shared/controls';

type Mode = 'direct' | 'reverse';
const H = 440;

export default function SolutionMiningSim() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [mode, setMode] = useState<Mode>('direct');
  const [blanket, setBlanket] = useState(0.25);
  const [t, setT] = useState(0.7);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useAnimationLoop((dt) => {
    setT((prev) => {
      const next = prev + (dt / 6000) * speed;
      return next >= 1 ? 0 : next;
    });
  }, playing);

  const w = width || 0;
  const cx = w / 2;
  const surfaceH = 150;
  const bedTop = 150;
  const bedBottom = 410;
  const casingShoe = 188;

  const blanketY = casingShoe + blanket * 110;
  const cavTopY = blanketY;
  const cavBotY = blanketY + (0.35 + 0.65 * t) * (bedBottom - 12 - blanketY);
  const Rmax = Math.max(28, w * 0.17);

  const profile = (f: number) =>
    mode === 'direct' ? 0.35 + 0.65 * f : 1.0 - 0.6 * f;
  const R = (f: number) => Rmax * t * profile(f);

  const N = 16;
  const right: string[] = [];
  const left: string[] = [];
  let volume = 0;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const y = cavTopY + f * (cavBotY - cavTopY);
    const r = R(f);
    right.push(`${cx + r},${y}`);
    left.unshift(`${cx - r},${y}`);
    volume += r * r;
  }
  const cavern = [...right, ...left].join(' ');
  const volM3 = Math.round((volume / N) * 0.9); // illustrative

  // active water/brine string ends
  const waterDown = mode === 'direct'; // direct: water via inner string to bottom
  const innerEndY = mode === 'direct' ? cavBotY - 6 : cavTopY + 10;

  return (
    <div className="viz">
      <div className="viz-controls">
        <SegmentedControl<Mode>
          label="Circulation"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'direct', label: 'Direct' },
            { value: 'reverse', label: 'Reverse' },
          ]}
        />
        <Slider label="Blanket depth" min={0} max={1} step={0.01} value={blanket} onChange={setBlanket} format={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Leaching time" min={0.05} max={1} step={0.01} value={t} onChange={(v) => { setPlaying(false); setT(v); }} format={(v) => `${Math.round(v * 36)} mo`} />
        <PlayButton playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => { setPlaying(false); setT(0.05); }} playLabel="Leach" pauseLabel="Pause" />
        <SpeedControl value={speed} onChange={setSpeed} />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Solution mining of a storage cavern">
            <rect x={0} y={0} width={w} height={surfaceH} fill="var(--viz-overburden)" opacity={0.7} />
            <rect x={0} y={bedTop} width={w} height={bedBottom - bedTop} fill="var(--viz-salt)" opacity={0.85} />
            <rect x={0} y={bedBottom} width={w} height={H - bedBottom} fill="var(--viz-overburden)" opacity={0.5} />
            <text x={w - 8} y={bedTop + 18} textAnchor="end" className="viz-tick" style={{ fontWeight: 600 }}>Salt / trona bed</text>

            {/* cavern */}
            <polygon points={cavern} fill="var(--viz-h2)" opacity={0.18} stroke="var(--viz-h2)" strokeWidth={2} />

            {/* blanket cap */}
            <line x1={cx - R(0) - 6} x2={cx + R(0) + 6} y1={blanketY} y2={blanketY} stroke="var(--accent-2)" strokeWidth={3} strokeLinecap="round" />
            <text x={cx + R(0) + 10} y={blanketY + 4} className="viz-tick" style={{ fill: 'var(--accent-2)' }}>blanket</text>

            {/* well: cemented casing to shoe */}
            <rect x={cx - 5} y={0} width={10} height={casingShoe} fill="var(--fg-muted)" />
            <rect x={cx - 9} y={-2} width={18} height={12} rx={2} fill="var(--fg)" />
            {/* hanging inner string */}
            <line x1={cx} y1={casingShoe} x2={cx} y2={innerEndY} stroke="var(--fg-faint)" strokeWidth={3} />

            {/* flow arrows */}
            <FlowArrow x={cx - 14} y1={20} y2={casingShoe - 8} down={!waterDown} color="var(--viz-c2)" />
            <FlowArrow x={cx + 14} y1={casingShoe - 8} y2={20} down={false} color="var(--viz-c2)" />
            <text x={cx - 30} y={40} textAnchor="end" className="viz-tick">{waterDown ? 'water' : 'brine'}</text>
            <text x={cx + 30} y={40} textAnchor="start" className="viz-tick">{waterDown ? 'brine' : 'water'}</text>
          </svg>
        )}
      </div>

      <StatGrid
        items={[
          { label: 'Elapsed', value: `${Math.round(t * 36)}`, unit: 'months' },
          { label: 'Cavern volume', value: volM3.toLocaleString(), unit: 'rel.' },
          { label: 'Circulation', value: mode === 'direct' ? 'Direct' : 'Reverse' },
        ]}
      />
      <p className="viz-note">
        Fresh water is injected, dissolves the rock, and the brine is pumped back
        out — slowly carving the cavern. <strong>Direct</strong> circulation widens it
        at the bottom; <strong>reverse</strong> widens it at the top. A lighter
        <em> blanket</em> fluid floats on the brine to protect the roof and set the
        cavern's ceiling. Shapes are illustrative.
      </p>
    </div>
  );
}

function FlowArrow({ x, y1, y2, down, color }: { x: number; y1: number; y2: number; down: boolean; color: string }) {
  const tip = down ? y2 : y2;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={2.5} opacity={0.8} />
      <polygon
        points={down ? `${x - 4},${tip - 6} ${x + 4},${tip - 6} ${x},${tip}` : `${x - 4},${tip + 6} ${x + 4},${tip + 6} ${x},${tip}`}
        fill={color}
        opacity={0.8}
      />
    </g>
  );
}
