import { useRef, useState } from 'react';
import { useResizeObserver, useAnimationLoop } from './_shared/hooks';
import { SegmentedControl, Slider, PlayButton, StatGrid } from './_shared/controls';

type Mode = 'salt' | 'trona';

interface HostSpec {
  label: string;
  mineral: string;
  formula: string;
  overburden: [number, number];
  caprock: [number, number];
  bed: [number, number];
  cavern: { top: number; bottom: number; wfrac: number };
  bedColor: string;
}

const HOST: Record<Mode, HostSpec> = {
  salt: {
    label: 'Salt cavern',
    mineral: 'Halite',
    formula: 'NaCl',
    overburden: [0, 760],
    caprock: [760, 820],
    bed: [820, 1640],
    cavern: { top: 900, bottom: 1480, wfrac: 0.15 },
    bedColor: 'var(--viz-salt)',
  },
  trona: {
    label: 'Trona cavern',
    mineral: 'Trona',
    formula: 'Na₃(CO₃)(HCO₃)·2H₂O',
    overburden: [0, 285],
    caprock: [285, 330],
    bed: [330, 700],
    cavern: { top: 375, bottom: 600, wfrac: 0.1 },
    bedColor: 'var(--viz-trona)',
  },
};

const MAX_DEPTH = 1700;
const LITHO_GRAD = 0.0226; // MPa per metre (~1 psi/ft)
const H = 480;

export default function CavernCrossSection() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [mode, setMode] = useState<Mode>('salt');
  const [fill, setFill] = useState(0.55);
  const [playing, setPlaying] = useState(false);
  const phase = useRef(Math.PI);

  useAnimationLoop((dt) => {
    phase.current += dt / 1700;
    setFill(0.5 - 0.5 * Math.cos(phase.current));
  }, playing);

  const w = width || 0;
  const host = HOST[mode];

  // depth -> y
  const padT = 18;
  const padB = 14;
  const plotTop = padT;
  const plotBottom = H - padB;
  const yOf = (d: number) => plotTop + (d / MAX_DEPTH) * (plotBottom - plotTop);

  const axisGutter = 44;
  const cx = axisGutter + (w - axisGutter) * 0.58;
  const cavernW = Math.min(140, Math.max(50, (w - axisGutter) * host.cavern.wfrac));
  const halfW = cavernW / 2;
  const cavTopY = yOf(host.cavern.top);
  const cavBotY = yOf(host.cavern.bottom);
  const cavH = cavBotY - cavTopY;
  const cap = Math.min(halfW, cavH / 2);
  const interfaceY = cavTopY + fill * cavH;

  const clipId = `cav-${mode}`;

  // pressure
  const midDepth = (host.cavern.top + host.cavern.bottom) / 2;
  const litho = LITHO_GRAD * midDepth;
  const minOp = 0.3 * litho;
  const maxOp = 0.8 * litho;
  const op = minOp + fill * (maxOp - minOp);

  const depthTicks = [0, 500, 1000, 1500];

  const band = (range: [number, number], color: string, opacity = 1) => (
    <rect
      x={0}
      y={yOf(range[0])}
      width={w}
      height={yOf(range[1]) - yOf(range[0])}
      fill={color}
      opacity={opacity}
    />
  );

  return (
    <div className="viz">
      <div className="viz-controls">
        <SegmentedControl<Mode>
          label="Host rock"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'salt', label: 'Salt' },
            { value: 'trona', label: 'Trona' },
          ]}
        />
        <Slider
          label="Stored H₂"
          min={0}
          max={1}
          step={0.01}
          value={fill}
          onChange={(v) => {
            setPlaying(false);
            setFill(v);
          }}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <PlayButton
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          playLabel="Cycle"
          pauseLabel="Pause"
        />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg
            className="viz-svg"
            width={w}
            height={H}
            viewBox={`0 0 ${w} ${H}`}
            role="img"
            aria-label={`Cross-section of a ${host.label} for hydrogen storage`}
          >
            <defs>
              <clipPath id={clipId}>
                <rect
                  x={cx - halfW}
                  y={cavTopY}
                  width={cavernW}
                  height={cavH}
                  rx={halfW}
                  ry={cap}
                />
              </clipPath>
            </defs>

            {/* sky / surface */}
            <rect x={0} y={0} width={w} height={plotTop} fill="var(--bg-sunken)" />

            {/* strata */}
            {band(host.overburden, 'var(--viz-overburden)')}
            {band(host.caprock, 'var(--viz-caprock)')}
            {band(host.bed, host.bedColor)}
            {band([host.bed[1], MAX_DEPTH], 'var(--viz-overburden)', 0.6)}

            {/* depth axis */}
            {depthTicks.map((d) => (
              <g key={d}>
                <line
                  x1={axisGutter}
                  x2={w}
                  y1={yOf(d)}
                  y2={yOf(d)}
                  className="viz-grid-line"
                  opacity={0.5}
                />
                <text
                  x={axisGutter - 6}
                  y={yOf(d) + 4}
                  textAnchor="end"
                  className="viz-tick"
                >
                  {d}
                </text>
              </g>
            ))}
            <text
              x={12}
              y={plotTop + 8}
              className="viz-axis-title"
              transform={`rotate(-90 12 ${(plotTop + plotBottom) / 2})`}
              textAnchor="middle"
            >
              Depth (m)
            </text>

            {/* wellbore */}
            <rect x={cx - 3} y={plotTop} width={6} height={cavTopY - plotTop} fill="var(--fg-faint)" opacity={0.7} />
            <rect x={cx - 10} y={plotTop - 6} width={20} height={10} rx={2} fill="var(--fg-muted)" />

            {/* cavern fill */}
            <g clipPath={`url(#${clipId})`}>
              <rect x={cx - halfW} y={cavTopY} width={cavernW} height={interfaceY - cavTopY} fill="var(--viz-h2)" opacity={0.55} />
              <rect x={cx - halfW} y={interfaceY} width={cavernW} height={cavBotY - interfaceY} fill="var(--viz-salt)" opacity={0.85} />
              {/* H2 bubbles in the gas cap */}
              {[
                [-0.3, 0.25],
                [0.25, 0.4],
                [0, 0.6],
                [-0.15, 0.78],
              ].map(([fx, fy], i) => {
                const by = cavTopY + fy * cavH;
                if (by > interfaceY - 4) return null;
                return (
                  <circle key={i} cx={cx + fx * halfW} cy={by} r={3.2} fill="var(--viz-h2)" />
                );
              })}
            </g>
            <rect
              x={cx - halfW}
              y={cavTopY}
              width={cavernW}
              height={cavH}
              rx={halfW}
              ry={cap}
              fill="none"
              stroke="var(--viz-h2)"
              strokeWidth={2}
            />

            {/* labels */}
            <text x={w - 8} y={yOf((host.overburden[0] + host.overburden[1]) / 2)} textAnchor="end" className="viz-tick">Overburden</text>
            <text x={w - 8} y={yOf((host.caprock[0] + host.caprock[1]) / 2) + 4} textAnchor="end" className="viz-tick">Caprock</text>
            <text x={w - 8} y={yOf(host.bed[0]) + 18} textAnchor="end" className="viz-tick" style={{ fontWeight: 600 }}>{host.mineral} bed</text>
            <text x={cx} y={cavTopY - 8} textAnchor="middle" className="viz-tick" style={{ fill: 'var(--viz-h2)', fontWeight: 600 }}>H₂</text>
          </svg>
        )}
      </div>

      <StatGrid
        items={[
          { label: 'Crown depth', value: String(host.cavern.top), unit: 'm' },
          { label: 'Host rock', value: host.mineral },
          { label: 'H₂ stored', value: `${Math.round(fill * 100)}`, unit: '%' },
          { label: 'Cavern pressure', value: op.toFixed(1), unit: 'MPa' },
        ]}
      />

      {/* operating pressure window */}
      <div>
        <div
          style={{
            position: 'relative',
            height: 12,
            borderRadius: 6,
            background: 'var(--viz-stress)',
            opacity: 0.95,
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              position: 'absolute',
              left: '30%',
              width: '50%',
              top: 0,
              bottom: 0,
              background: 'var(--viz-good)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(100, Math.max(0, (op / litho) * 100))}%`,
              top: -3,
              width: 3,
              height: 18,
              background: 'var(--fg)',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: 'var(--fg-faint)',
            marginTop: 4,
          }}
        >
          <span>Too low: creep closure</span>
          <span>Safe operating window</span>
          <span>Too high: fracturing</span>
        </div>
      </div>

      <p className="viz-note">
        Pressure as a fraction of the lithostatic load at cavern depth
        (~{LITHO_GRAD} MPa/m). Geometry is illustrative: salt hosts deeper, thicker
        caverns; trona beds are shallower, thinner, and more soluble.
      </p>
    </div>
  );
}
