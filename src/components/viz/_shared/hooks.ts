import { useEffect, useRef, useState } from 'react';

/** Measure an element's content box; re-measures on resize. */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) {
        setSize({
          width: Math.round(e.contentRect.width),
          height: Math.round(e.contentRect.height),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
}

/** True when the user prefers reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Read CSS custom properties (without the leading `--`) and re-read whenever
 * the [data-theme] attribute changes. Only needed when a real color value is
 * required in JS (e.g. canvas, color interpolation). For SVG, prefer
 * `fill="var(--token)"` directly.
 */
export function useThemeTokens<K extends string>(
  names: readonly K[]
): Record<K, string> {
  const read = () => {
    const out = {} as Record<K, string>;
    if (typeof document === 'undefined') return out;
    const cs = getComputedStyle(document.documentElement);
    for (const n of names) out[n] = cs.getPropertyValue(`--${n}`).trim();
    return out;
  };

  const [tokens, setTokens] = useState<Record<K, string>>(() => read());

  useEffect(() => {
    setTokens(read());
    const obs = new MutationObserver(() => setTokens(read()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join('|')]);

  return tokens;
}

/** Run a callback every animation frame while `active` is true. */
export function useAnimationLoop(
  callback: (deltaMs: number) => void,
  active: boolean
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      cbRef.current(dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
