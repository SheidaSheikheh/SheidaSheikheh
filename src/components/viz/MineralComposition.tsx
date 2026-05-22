import { useState } from 'react';
import { SegmentedControl, Legend } from './_shared/controls';

type Basis = 'mass' | 'atoms';

const EL_COLOR: Record<string, string> = {
  Na: 'var(--viz-c1)',
  Cl: 'var(--viz-c2)',
  C: 'var(--viz-c3)',
  O: 'var(--viz-c4)',
  H: 'var(--viz-c5)',
};

type Seg = [string, number];

const DATA: Record<Basis, Record<string, Seg[]>> = {
  mass: {
    halite: [['Na', 39.3], ['Cl', 60.7]],
    trona: [['Na', 30.5], ['C', 10.6], ['O', 56.6], ['H', 2.2]],
  },
  atoms: {
    halite: [['Na', 50], ['Cl', 50]],
    trona: [['Na', 16.7], ['C', 11.1], ['O', 44.4], ['H', 27.8]],
  },
};

const MINERALS = [
  { id: 'halite', name: 'Halite (rock salt)', formula: 'NaCl', molar: '58.4' },
  { id: 'trona', name: 'Trona', formula: 'Na₃(CO₃)(HCO₃)·2H₂O', molar: '226.0' },
];

export default function MineralComposition() {
  const [basis, setBasis] = useState<Basis>('mass');

  return (
    <div className="viz">
      <div className="viz-controls">
        <SegmentedControl<Basis>
          label="Show by"
          value={basis}
          onChange={setBasis}
          options={[
            { value: 'mass', label: 'Mass %' },
            { value: 'atoms', label: 'Atom %' },
          ]}
        />
      </div>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {MINERALS.map((m) => {
          const segs = DATA[basis][m.id];
          return (
            <div key={m.id}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  marginBottom: '0.4rem',
                  fontSize: '0.92rem',
                }}
              >
                <strong>{m.name}</strong>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>
                  {m.formula}
                </span>
                <span style={{ color: 'var(--fg-faint)' }}>· {m.molar} g/mol</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  height: 40,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                {segs.map(([el, pct]) => (
                  <div
                    key={el}
                    title={`${el}: ${pct}%`}
                    style={{
                      flexGrow: pct,
                      flexBasis: 0,
                      minWidth: 0,
                      background: EL_COLOR[el],
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pct >= 9 ? `${el} ${pct}%` : ''}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Legend
        items={['Na', 'Cl', 'C', 'O', 'H'].map((el) => ({
          color: EL_COLOR[el],
          label: el,
        }))}
      />
      <p className="viz-note">
        Trona (sodium sesquicarbonate) is chemically richer than halite — it carries
        carbonate, bicarbonate and structural water. That extra chemistry makes it
        far more soluble, which shapes how its caverns are leached and how they behave.
      </p>
    </div>
  );
}
