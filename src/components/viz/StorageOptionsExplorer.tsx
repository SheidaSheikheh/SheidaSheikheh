import { useState } from 'react';
import { useResizeObserver } from './_shared/hooks';
import { SegmentedControl } from './_shared/controls';

type Attr = 'capacity' | 'cushion' | 'cycling' | 'maturity' | 'cost';

const ATTRS: { id: Attr; label: string; better: 'high' | 'low' }[] = [
  { id: 'capacity', label: 'Working capacity', better: 'high' },
  { id: 'cushion', label: 'Cushion gas', better: 'low' },
  { id: 'cycling', label: 'Cycling speed', better: 'high' },
  { id: 'maturity', label: 'H₂ maturity', better: 'high' },
  { id: 'cost', label: 'Build cost', better: 'low' },
];

interface StoreType {
  id: string;
  name: string;
  color: string;
  values: Record<Attr, number>;
  desc: string;
}

const TYPES: StoreType[] = [
  {
    id: 'salt',
    name: 'Salt cavern',
    color: 'var(--viz-c1)',
    values: { capacity: 55, cushion: 30, cycling: 95, maturity: 90, cost: 45 },
    desc: 'Engineered voids leached from salt. Fast cycling, low cushion gas, gas-tight — the front-runner for hydrogen.',
  },
  {
    id: 'depleted',
    name: 'Depleted reservoir',
    color: 'var(--viz-c2)',
    values: { capacity: 95, cushion: 60, cycling: 45, maturity: 40, cost: 30 },
    desc: 'Former gas fields with proven seals and huge capacity, but slow to cycle and cushion-gas hungry; residual hydrocarbons can react with H₂.',
  },
  {
    id: 'aquifer',
    name: 'Aquifer',
    color: 'var(--viz-c3)',
    values: { capacity: 80, cushion: 75, cycling: 35, maturity: 30, cost: 35 },
    desc: 'Porous water-bearing rock with no proven trap history — large potential capacity, but high uncertainty and lots of cushion gas.',
  },
  {
    id: 'lined',
    name: 'Lined rock cavern',
    color: 'var(--viz-c4)',
    values: { capacity: 30, cushion: 25, cycling: 90, maturity: 50, cost: 80 },
    desc: 'Mined caverns with an engineered liner. Flexible siting and fast cycling, but expensive to build.',
  },
];

const H = 232;

export default function StorageOptionsExplorer() {
  const [ref, { width }] = useResizeObserver<HTMLDivElement>();
  const [attr, setAttr] = useState<Attr>('capacity');
  const [selected, setSelected] = useState('salt');

  const w = width || 0;
  const labelW = 132;
  const valueW = 40;
  const rowH = H / TYPES.length;
  const barMax = Math.max(40, w - labelW - valueW);
  const attrMeta = ATTRS.find((a) => a.id === attr)!;
  const sel = TYPES.find((t) => t.id === selected)!;

  return (
    <div className="viz">
      <div className="viz-controls">
        <SegmentedControl<Attr>
          label="Compare by"
          value={attr}
          onChange={setAttr}
          options={ATTRS.map((a) => ({ value: a.id, label: a.label }))}
        />
        <span className="chip" style={{ alignSelf: 'end' }}>
          {attrMeta.better === 'high' ? 'Higher is better' : 'Lower is better'}
        </span>
      </div>

      <div className="viz-canvas" ref={ref} style={{ minHeight: H }}>
        {w > 0 && (
          <svg className="viz-svg" width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label={`Storage types compared by ${attrMeta.label}`}>
            {TYPES.map((t, i) => {
              const v = t.values[attr];
              const y = i * rowH + rowH / 2;
              const bw = (v / 100) * barMax;
              const isSel = t.id === selected;
              return (
                <g key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(t.id)}>
                  <text x={0} y={y + 4} className="viz-tick" style={{ fontSize: 12.5, fontWeight: isSel ? 700 : 500 }}>
                    {t.name}
                  </text>
                  <rect x={labelW} y={y - 11} width={barMax} height={22} rx={5} fill="var(--bg-sunken)" />
                  <rect x={labelW} y={y - 11} width={bw} height={22} rx={5} fill={t.color} opacity={isSel ? 1 : 0.55} />
                  <text x={labelW + bw + 6} y={y + 4} className="viz-tick" style={{ fontSize: 12, fontWeight: 600, fill: isSel ? 'var(--fg)' : 'var(--fg-muted)' }}>
                    {v}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="surface" style={{ padding: '0.85rem 1rem', borderLeft: `3px solid ${sel.color}` }} aria-live="polite">
        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{sel.name}</strong>
        <span style={{ color: 'var(--fg-muted)', fontSize: '0.92rem' }}>{sel.desc}</span>
      </div>
      <p className="viz-note">Tap a bar to read about that storage type. Scores are illustrative 0–100 ratings.</p>
    </div>
  );
}
