import { useState } from 'react';

interface HColor {
  id: string;
  name: string;
  swatch: string;
  ink: string;
  feedstock: string;
  process: string;
  co2: number; // kg CO2e per kg H2 (illustrative)
  note: string;
}

const COLORS: HColor[] = [
  { id: 'green', name: 'Green', swatch: '#3a8c5f', ink: '#fff', feedstock: 'Water + renewable electricity', process: 'Electrolysis', co2: 0.5, note: 'Splitting water with wind or solar power. Near-zero emissions — the goal of a clean hydrogen economy.' },
  { id: 'pink', name: 'Pink', swatch: '#d6679b', ink: '#fff', feedstock: 'Water + nuclear electricity', process: 'Electrolysis', co2: 0.5, note: 'Electrolysis powered by nuclear energy. Also very low carbon, with steady output.' },
  { id: 'turquoise', name: 'Turquoise', swatch: '#16a39a', ink: '#fff', feedstock: 'Natural gas', process: 'Methane pyrolysis', co2: 2.5, note: 'Splits methane into hydrogen and solid carbon (not CO2) — emerging and promising if the carbon is stored or used.' },
  { id: 'blue', name: 'Blue', swatch: '#2f6fd0', ink: '#fff', feedstock: 'Natural gas', process: 'Steam reforming + carbon capture', co2: 3, note: 'Conventional reforming, but most of the CO2 is captured and stored. Lower carbon — though capture is never 100%.' },
  { id: 'grey', name: 'Grey', swatch: '#8b909c', ink: '#fff', feedstock: 'Natural gas', process: 'Steam reforming (no capture)', co2: 10, note: 'Today’s dominant, cheapest route — and a major CO2 source. Most hydrogen made now is grey.' },
  { id: 'black', name: 'Brown / Black', swatch: '#4b4540', ink: '#fff', feedstock: 'Coal', process: 'Gasification (no capture)', co2: 19, note: 'Hydrogen from coal, with the highest emissions of all.' },
];
const MAX_CO2 = 20;

export default function HydrogenColors() {
  const [sel, setSel] = useState('green');
  const c = COLORS.find((x) => x.id === sel)!;
  const sev = c.co2 < 1.5 ? 'var(--viz-good)' : c.co2 < 5 ? 'var(--viz-warn)' : 'var(--viz-stress)';

  return (
    <div className="viz">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {COLORS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setSel(x.id)}
            aria-pressed={sel === x.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '999px',
              border: `1px solid ${sel === x.id ? 'var(--accent)' : 'var(--border)'}`,
              background: sel === x.id ? 'var(--bg-sunken)' : 'var(--bg-elev)',
              color: 'var(--fg)',
              font: 'inherit',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: x.swatch, flex: 'none' }} />
            {x.name}
          </button>
        ))}
      </div>

      <div className="surface" style={{ padding: '1.1rem 1.2rem', display: 'grid', gap: '0.9rem' }} aria-live="polite">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: c.swatch, flex: 'none' }} />
          <strong style={{ fontSize: '1.15rem' }}>{c.name} hydrogen</strong>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: '0.92rem' }}>
          <span><span style={{ color: 'var(--fg-faint)' }}>Feedstock: </span>{c.feedstock}</span>
          <span><span style={{ color: 'var(--fg-faint)' }}>Process: </span>{c.process}</span>
        </div>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.95rem', margin: 0 }}>{c.note}</p>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--fg-faint)', marginBottom: '0.3rem' }}>
            <span>CO₂ intensity</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: sev }}>~{c.co2} kg CO₂ / kg H₂</span>
          </div>
          <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(c.co2 / MAX_CO2) * 100}%`, background: sev, borderRadius: 6, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>
      <p className="viz-note">Hydrogen is colourless — the "colours" are shorthand for how it is made. Emissions are approximate, illustrative figures.</p>
    </div>
  );
}
