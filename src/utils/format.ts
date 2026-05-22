/** "May 22, 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** "2026-05-22" for <time datetime> */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Rough reading time in minutes from raw post body. */
export function readingTime(body: string): number {
  const text = body
    .replace(/import\s.+from\s.+/g, '') // strip MDX imports
    .replace(/<[^>]+>/g, ' ') // strip JSX/HTML tags
    .replace(/[#*_`>|-]/g, ' '); // strip markdown punctuation
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
