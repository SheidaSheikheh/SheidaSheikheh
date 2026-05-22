import { useMemo, useState } from 'react';
import { Slider } from './_shared/controls';
import { RotateCcw } from 'lucide-react';

type CritId = 'depth' | 'caprock' | 'demand' | 'seismic' | 'reservoir';

const CRITERIA: { id: CritId; label: string }[] = [
  { id: 'depth', label: 'Depth suitability' },
  { id: 'caprock', label: 'Caprock integrity' },
  { id: 'demand', label: 'Proximity to demand' },
  { id: 'seismic', label: 'Seismic stability' },
  { id: 'reservoir', label: 'Reservoir quality' },
];

interface Site {
  name: string;
  color: string;
  scores: Record<CritId, number>;
}

const SITES: Site[] = [
  { name: 'Green River Basin', color: 'var(--viz-c1)', scores: { depth: 70, caprock: 75, demand: 65, seismic: 80, reservoir: 85 } },
  { name: 'Powder River Basin', color: 'var(--viz-c2)', scores: { depth: 85, caprock: 80, demand: 55, seismic: 75, reservoir: 70 } },
  { name: 'Wind River Basin', color: 'var(--viz-c3)', scores: { depth: 60, caprock: 65, demand: 50, seismic: 70, reservoir: 60 } },
];

const DEFAULT_W: Record<CritId, number> = {
  depth: 3,
  caprock: 3,
  demand: 3,
  seismic: 3,
  reservoir: 3,
};

export default function SiteSelectionCriteria() {
  const [weights, setWeights] = useState<Record<CritId, number>>({ ...DEFAULT_W });

  const ranked = useMemo(() => {
    const total = CRITERIA.reduce((s, c) => s + weights[c.id], 0) || 1;
    return SITES.map((site) => {
      const score =
        CRITERIA.reduce((s, c) => s + site.scores[c.id] * weights[c.id], 0) / total;
      return { ...site, score };
    }).sort((a, b) => b.score - a.score);
  }, [weights]);

  return (
    <div className="viz">
      <div style={{ display: 'grid', gap: '0.6rem 1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))' }}>
        {CRITERIA.map((c) => (
          <Slider
            key={c.id}
            label={c.label}
            min={0}
            max={5}
            step={1}
            value={weights[c.id]}
            onChange={(v) => setWeights((prev) => ({ ...prev, [c.id]: v }))}
            format={(v) => `weight ${v}`}
          />
        ))}
        <button
          type="button"
          className="viz-btn"
          style={{ alignSelf: 'end', justifySelf: 'start' }}
          onClick={() => setWeights({ ...DEFAULT_W })}
        >
          <RotateCcw aria-hidden="true" /> Reset weights
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.85rem' }}>
        {ranked.map((site, i) => (
          <div key={site.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {i === 0 && (
                  <span className="chip chip--accent" style={{ marginRight: '0.5rem', padding: '0.1rem 0.5rem', fontSize: '0.72rem' }}>
                    Best fit
                  </span>
                )}
                {site.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>
                {site.score.toFixed(0)}
              </span>
            </div>
            <div style={{ height: 16, borderRadius: 8, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${site.score}%`,
                  background: site.color,
                  borderRadius: 8,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="viz-note">
        Move the sliders to weight what matters most to you, and the ranking
        updates. There's no single "best" site — it depends on whether you
        prioritise geology, safety, or being close to where the hydrogen is used.
        Scores are illustrative.
      </p>
    </div>
  );
}
