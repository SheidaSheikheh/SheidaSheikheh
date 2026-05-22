import { useState } from 'react';
import { useResizeObserver, useAnimationLoop } from './_shared/hooks';
import { PlayButton, Slider, StatGrid, Legend } from './_shared/controls';

const H = 360;
const MAX_CYCLES = 5;
const SUB = 3; // mud, trona, halite
const TOTAL = MAX_CYCLES * SUB;

const TYPE = [
  { name: 'Carbonate mud', color: 'var(--viz-caprock)', stage: 'Carbonate mud settles' },
  { name: 'Trona', color: 'var(--viz-trona)', stage: 'Trona precipitates' },
  { name: 'Halite', color: 'var(--viz-salt)', stage: 'Halite precipitates' },
];

export default function EvaporiteFormation() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [t, setT] = useState(0.6);
  const [playing, setPlaying] = useState(false);

  useAnimationLoop((dt) => {
    setT((prev) => {
      const next = prev + dt / 9000;
      return next >= 1 ? 0 : next;
    });
  }, playing);

  const w = width || 0;
  const floorY = H - 26;
  const layerH = 250 / TOTAL;

  const totalDep = t * TOTAL;
  const complete = Math.floor(totalDep);
  const partial = totalDep - complete;
  const depositTopY = floorY - totalDep * layerH;

  // current depositing type + water recession within the current sublayer
  const curType = complete % SUB;
  const waterDepth = (1 - partial) * 70 + 8;
  const waterTopY = depositTopY - waterDepth;
  const stage = partial < 0.08 ? 'Lake refills, then evaporates' : TYPE[curType].stage;

  return (
    <div className="viz">
      <div className="viz-controls">
        <PlayButton playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => { setPlaying(false); setT(0); }} playLabel="Run cycles" pauseLabel="Pause" />
        <Slider label="Geologic time" min={0} max={1} step={0.005} value={t} onChange={(v) => { setPlaying(false); setT(v); }} format={(v) => `cycle ${Math.min(MAX_CYCLES, Math.floor(v * MAX_CYCLES) + 1)}`} />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Formation of bedded evaporite layers">
            <rect x={0} y={0} width={w} height={H} fill="var(--bg-sunken)" />

            {/* water body */}
            {waterDepth > 9 && (
              <g>
                <rect x={0} y={waterTopY} width={w} height={depositTopY - waterTopY} fill="var(--accent)" opacity={0.16} />
                <line x1={0} x2={w} y1={waterTopY} y2={waterTopY} stroke="var(--accent)" strokeWidth={1.5} opacity={0.5} />
              </g>
            )}

            {/* deposited layers, stacked from the floor up */}
            {Array.from({ length: complete }, (_, i) => {
              const ty = floorY - (i + 1) * layerH;
              return <rect key={i} x={0} y={ty} width={w} height={layerH + 0.5} fill={TYPE[i % SUB].color} opacity={0.9} />;
            })}
            {/* current partial layer */}
            {partial > 0.01 && complete < TOTAL && (
              <rect x={0} y={floorY - (complete * layerH) - partial * layerH} width={w} height={partial * layerH + 0.5} fill={TYPE[curType].color} opacity={0.9} />
            )}

            <text x={10} y={floorY - 6} className="viz-tick">basin floor</text>
            <text x={w - 8} y={Math.max(20, waterTopY - 6)} textAnchor="end" className="viz-tick" style={{ fill: 'var(--accent)' }}>{stage}</text>
          </svg>
        )}
      </div>

      <Legend items={TYPE.map((x) => ({ color: x.color, label: x.name }))} />
      <StatGrid
        items={[
          { label: 'Cycle', value: `${Math.min(MAX_CYCLES, Math.floor(t * MAX_CYCLES) + 1)} / ${MAX_CYCLES}` },
          { label: 'Beds formed', value: String(complete) },
          { label: 'Stage', value: partial < 0.08 ? 'Refilling' : TYPE[curType].name },
        ]}
      />
      <p className="viz-note">
        A shallow desert lake floods, then evaporates — and as it concentrates,
        minerals drop out in order: carbonate mud, then trona, then halite. Repeat
        this for millions of years and you build the thick bedded trona of the Green
        River Formation. Schematic and illustrative.
      </p>
    </div>
  );
}
