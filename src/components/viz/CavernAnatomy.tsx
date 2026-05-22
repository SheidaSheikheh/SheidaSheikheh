import { useState } from 'react';
import { useResizeObserver } from './_shared/hooks';

interface Part {
  id: string;
  label: string;
  info: string;
}
const PARTS: Record<string, Part> = {
  wellhead: { id: 'wellhead', label: 'Wellhead', info: 'Surface valves and connections that control injection and withdrawal of hydrogen.' },
  casing: { id: 'casing', label: 'Cemented casing', info: 'Steel pipe cemented into the rock, sealing the well from aquifers and surrounding formations.' },
  shoe: { id: 'shoe', label: 'Last cemented casing shoe', info: 'The depth where cementing ends and the cavern begins — the key pressure-integrity point of the whole system.' },
  working: { id: 'working', label: 'Working gas', info: 'The hydrogen that is actually cycled in and out as the store charges and discharges.' },
  cushion: { id: 'cushion', label: 'Cushion gas', info: 'Permanent gas kept in the cavern to maintain pressure, hold the walls open, and sustain deliverability.' },
  sump: { id: 'sump', label: 'Sump', info: 'Dead space at the bottom where insoluble minerals left over from leaching collect.' },
};

const H = 460;

export default function CavernAnatomy() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [sel, setSel] = useState('working');

  const w = width || 0;
  const cx = w * 0.42;
  const shoeY = 200;
  const cavTop = 214;
  const cavBot = 408;
  const halfW = Math.min(80, Math.max(46, w * 0.13));
  const cavH = cavBot - cavTop;
  const workBot = cavTop + 0.5 * cavH;
  const sumpTop = cavBot - 0.12 * cavH;
  const clip = 'cav-anatomy';
  const part = PARTS[sel];

  const hot = (id: string) => ({
    onClick: () => setSel(id),
    style: { cursor: 'pointer' as const },
  });
  const active = (id: string) => sel === id;

  return (
    <div className="viz">
      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Anatomy of a storage cavern">
            <defs>
              <clipPath id={clip}>
                <rect x={cx - halfW} y={cavTop} width={halfW * 2} height={cavH} rx={halfW} ry={Math.min(halfW, cavH / 2)} />
              </clipPath>
            </defs>

            {/* strata */}
            <rect x={0} y={0} width={w} height={130} fill="var(--viz-overburden)" opacity={0.7} />
            <rect x={0} y={130} width={w} height={20} fill="var(--viz-caprock)" opacity={0.7} />
            <rect x={0} y={150} width={w} height={290} fill="var(--viz-salt)" opacity={0.7} />
            <text x={12} y={170} className="viz-tick" style={{ fontWeight: 600 }}>Salt / trona bed</text>

            {/* cavern fills (clipped) */}
            <g clipPath={`url(#${clip})`}>
              <rect {...hot('working')} x={cx - halfW} y={cavTop} width={halfW * 2} height={workBot - cavTop} fill="var(--viz-h2)" opacity={active('working') ? 0.5 : 0.32} />
              <rect {...hot('cushion')} x={cx - halfW} y={workBot} width={halfW * 2} height={sumpTop - workBot} fill="var(--viz-h2)" opacity={active('cushion') ? 0.85 : 0.6} />
              <rect {...hot('sump')} x={cx - halfW} y={sumpTop} width={halfW * 2} height={cavBot - sumpTop} fill="var(--viz-caprock)" opacity={active('sump') ? 1 : 0.8} />
            </g>
            <rect x={cx - halfW} y={cavTop} width={halfW * 2} height={cavH} rx={halfW} ry={Math.min(halfW, cavH / 2)} fill="none" stroke="var(--fg-muted)" strokeWidth={1.5} />

            {/* well */}
            <rect {...hot('casing')} x={cx - 5} y={10} width={10} height={shoeY - 10} fill={active('casing') ? 'var(--accent)' : 'var(--fg-muted)'} />
            <rect {...hot('wellhead')} x={cx - 11} y={2} width={22} height={13} rx={2} fill={active('wellhead') ? 'var(--accent)' : 'var(--fg)'} />
            <line x1={cx} y1={shoeY} x2={cx} y2={workBot + 10} stroke="var(--fg-faint)" strokeWidth={2.5} />
            <circle {...hot('shoe')} cx={cx} cy={shoeY} r={6} fill={active('shoe') ? 'var(--accent)' : 'var(--bg)'} stroke="var(--fg-muted)" strokeWidth={2} />

            {/* labels (right side, clickable) */}
            {[
              ['wellhead', 8],
              ['casing', 110],
              ['shoe', shoeY],
              ['working', (cavTop + workBot) / 2],
              ['cushion', (workBot + sumpTop) / 2],
              ['sump', (sumpTop + cavBot) / 2],
            ].map(([id, y]) => (
              <text
                key={id as string}
                {...hot(id as string)}
                x={w - 8}
                y={(y as number) + 4}
                textAnchor="end"
                className="viz-tick"
                style={{ fontWeight: active(id as string) ? 700 : 500, fill: active(id as string) ? 'var(--accent)' : 'var(--fg-muted)' }}
              >
                {PARTS[id as string].label}
              </text>
            ))}
          </svg>
        )}
      </div>

      <div className="surface" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid var(--accent)' }} aria-live="polite">
        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{part.label}</strong>
        <span style={{ color: 'var(--fg-muted)', fontSize: '0.92rem' }}>{part.info}</span>
      </div>
      <p className="viz-note">Tap any part — or its label — to learn what it does. An operating cavern holds gas, not brine; only the working gas above the cushion is cycled.</p>
    </div>
  );
}
