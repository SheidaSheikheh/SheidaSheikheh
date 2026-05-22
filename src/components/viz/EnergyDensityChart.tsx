import { useState } from 'react';
import { SegmentedControl } from './_shared/controls';

type Metric = 'mass' | 'volume';

interface Fuel {
  name: string;
  mass: number; // MJ/kg (LHV)
  volume: number; // MJ/L (at a practical storage condition)
  h2?: boolean;
}
// Illustrative LHV figures.
const FUELS: Fuel[] = [
  { name: 'Hydrogen (700 bar)', mass: 120, volume: 4.8, h2: true },
  { name: 'Natural gas (CNG)', mass: 50, volume: 9 },
  { name: 'Gasoline', mass: 44, volume: 34 },
  { name: 'Li-ion battery', mass: 0.9, volume: 2.2 },
];

const META: Record<Metric, { label: string; unit: string; max: number }> = {
  mass: { label: 'Energy per kilogram', unit: 'MJ/kg', max: 130 },
  volume: { label: 'Energy per litre', unit: 'MJ/L', max: 36 },
};

export default function EnergyDensityChart() {
  const [metric, setMetric] = useState<Metric>('mass');
  const m = META[metric];
  const rows = [...FUELS].sort((a, b) => b[metric] - a[metric]);

  return (
    <div className="viz">
      <div className="viz-controls">
        <SegmentedControl<Metric>
          label="Compare by"
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'mass', label: 'Per mass' },
            { value: 'volume', label: 'Per volume' },
          ]}
        />
      </div>

      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {rows.map((f) => (
          <div key={f.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: f.h2 ? 700 : 500, color: f.h2 ? 'var(--accent)' : 'var(--fg)' }}>{f.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{f[metric]} {m.unit}</span>
            </div>
            <div style={{ height: 16, borderRadius: 8, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(f[metric] / m.max) * 100}%`, background: f.h2 ? 'var(--accent)' : 'var(--viz-c2)', opacity: f.h2 ? 1 : 0.7, borderRadius: 8, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>

      <p className="viz-note">
        Hydrogen carries the most energy <strong>per kilogram</strong> of any fuel —
        but among the least <strong>per litre</strong>. That single fact is why storing
        useful amounts means handling huge volumes, and why the cheapest place to put
        it is underground. Illustrative lower-heating-value figures.
      </p>
    </div>
  );
}
