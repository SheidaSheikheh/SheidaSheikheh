import { useState } from 'react';
import { useResizeObserver } from './_shared/hooks';
import { Slider, StatGrid, Legend } from './_shared/controls';

const HYDRO = 0.0098; // MPa/m
const LITHO = 0.0226; // MPa/m
const MAX_DEPTH = 2000;
const MAX_P = 46;
const H = 320;

export default function OperatingPressureWindow() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [depth, setDepth] = useState(1000);

  const w = width || 0;
  const padL = 44;
  const padR = 14;
  const padT = 12;
  const padB = 34;
  const plotW = Math.max(40, w - padL - padR);
  const plotH = H - padT - padB;
  const xP = (p: number) => padL + (p / MAX_P) * plotW;
  const yD = (d: number) => padT + (d / MAX_DEPTH) * plotH;

  const litho = LITHO * depth;
  const minOp = 0.3 * litho;
  const maxOp = 0.8 * litho;
  const windowWidth = maxOp - minOp;

  const line = (grad: number) =>
    `${xP(0)},${yD(0)} ${xP(grad * MAX_DEPTH)},${yD(MAX_DEPTH)}`;
  const windowArea = `${xP(0)},${yD(0)} ${xP(0.3 * LITHO * MAX_DEPTH)},${yD(MAX_DEPTH)} ${xP(0.8 * LITHO * MAX_DEPTH)},${yD(MAX_DEPTH)} ${xP(0)},${yD(0)}`;

  return (
    <div className="viz">
      <div className="viz-controls">
        <Slider
          label="Cavern depth"
          min={300}
          max={MAX_DEPTH}
          step={50}
          value={depth}
          onChange={setDepth}
          format={(v) => `${v} m`}
        />
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Operating pressure window versus depth">
            {/* depth grid */}
            {[0, 500, 1000, 1500, 2000].map((d) => (
              <g key={d}>
                <line x1={padL} x2={w - padR} y1={yD(d)} y2={yD(d)} className="viz-grid-line" />
                <text x={padL - 6} y={yD(d) + 4} textAnchor="end" className="viz-tick">{d}</text>
              </g>
            ))}
            {/* pressure ticks */}
            {[0, 10, 20, 30, 40].map((p) => (
              <text key={p} x={xP(p)} y={H - padB + 16} textAnchor="middle" className="viz-tick">{p}</text>
            ))}
            <text x={padL + plotW / 2} y={H - 3} textAnchor="middle" className="viz-axis-title">Pressure (MPa)</text>
            <text x={12} y={padT + plotH / 2} className="viz-axis-title" transform={`rotate(-90 12 ${padT + plotH / 2})`} textAnchor="middle">Depth (m)</text>

            {/* operating window */}
            <polygon points={windowArea} fill="var(--viz-good)" opacity={0.16} />
            <polyline points={line(0.3 * LITHO)} fill="none" stroke="var(--viz-good)" strokeWidth={1.5} strokeDasharray="5 4" />
            <polyline points={line(0.8 * LITHO)} fill="none" stroke="var(--viz-good)" strokeWidth={1.5} strokeDasharray="5 4" />

            {/* gradients */}
            <polyline points={line(HYDRO)} fill="none" stroke="var(--viz-c3)" strokeWidth={2} />
            <polyline points={line(LITHO)} fill="none" stroke="var(--viz-c2)" strokeWidth={2} />

            {/* selected depth marker */}
            <line x1={padL} x2={w - padR} y1={yD(depth)} y2={yD(depth)} stroke="var(--fg-faint)" strokeDasharray="2 3" />
            <line x1={xP(minOp)} x2={xP(maxOp)} y1={yD(depth)} y2={yD(depth)} stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" />
            <circle cx={xP(minOp)} cy={yD(depth)} r={4} fill="var(--viz-good)" />
            <circle cx={xP(maxOp)} cy={yD(depth)} r={4} fill="var(--viz-good)" />
          </svg>
        )}
      </div>

      <Legend
        items={[
          { color: 'var(--viz-c2)', label: 'Lithostatic', line: true },
          { color: 'var(--viz-c3)', label: 'Hydrostatic', line: true },
          { color: 'var(--viz-good)', label: 'Safe window' },
        ]}
      />
      <StatGrid
        items={[
          { label: 'Min pressure', value: minOp.toFixed(1), unit: 'MPa' },
          { label: 'Max pressure', value: maxOp.toFixed(1), unit: 'MPa' },
          { label: 'Window width', value: windowWidth.toFixed(1), unit: 'MPa' },
        ]}
      />
      <p className="viz-note">
        Deeper caverns sit under more overburden, so their safe pressure window is
        both higher and wider — meaning more hydrogen per cavern. Gradients are
        typical values; the 0.3–0.8 × lithostatic window is a common design rule of thumb.
      </p>
    </div>
  );
}
