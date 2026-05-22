import type { ReactNode } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

/* ---- Segmented control -------------------------------------------------- */
export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="viz-control">
      {label && <span className="viz-control-label">{label}</span>}
      <div className="viz-seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Slider ------------------------------------------------------------- */
export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="viz-slider">
      <span className="viz-slider-head">
        <span>{label}</span>
        <span className="viz-slider-value">
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/* ---- Toggle ------------------------------------------------------------- */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="viz-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

/* ---- Play / pause / reset ---------------------------------------------- */
export function PlayButton({
  playing,
  onToggle,
  onReset,
  playLabel = 'Play',
  pauseLabel = 'Pause',
}: {
  playing: boolean;
  onToggle: () => void;
  onReset?: () => void;
  playLabel?: string;
  pauseLabel?: string;
}) {
  return (
    <div className="viz-control--row">
      <button
        type="button"
        className="viz-btn viz-btn--primary"
        onClick={onToggle}
        aria-pressed={playing}
      >
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        {playing ? pauseLabel : playLabel}
      </button>
      {onReset && (
        <button
          type="button"
          className="viz-btn"
          onClick={onReset}
          aria-label="Reset"
        >
          <RotateCcw aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* ---- Speed control ------------------------------------------------------ */
export function SpeedControl({
  value,
  onChange,
  options = [0.5, 1, 2],
}: {
  value: number;
  onChange: (v: number) => void;
  options?: number[];
}) {
  return (
    <div className="viz-control">
      <span className="viz-control-label">Speed</span>
      <div className="viz-seg" role="group" aria-label="Animation speed">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}>
            {o}×
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Legend ------------------------------------------------------------- */
export interface LegendItem {
  color: string;
  label: string;
  line?: boolean;
}
export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="viz-legend">
      {items.map((it) => (
        <span className="viz-legend-item" key={it.label}>
          <span
            className={it.line ? 'viz-swatch viz-swatch--line' : 'viz-swatch'}
            style={{ background: it.color }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ---- Stat readouts ------------------------------------------------------ */
export interface StatItem {
  label: string;
  value: string;
  unit?: string;
}
export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="viz-stats">
      {items.map((s) => (
        <div className="viz-stat" key={s.label}>
          <div className="viz-stat-label">{s.label}</div>
          <div className="viz-stat-value">
            {s.value}
            {s.unit && <small> {s.unit}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}
