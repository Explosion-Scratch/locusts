const UNITS = [
  { unit: 'year', ms: 365.25 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30.44 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

/**
 * Format a date string into a human-readable format.
 * @param {string} dateStr - ISO date string or parseable date
 * @returns {string} e.g. "May 21, 2026"
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get a natural language relative time string.
 * @param {string} dateStr - ISO date string or parseable date
 * @returns {string} e.g. "3 months ago", "just now"
 */
export function relativeTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const isFuture = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  if (absDiff < 60 * 1000) {
    return 'just now';
  }

  for (const { unit, ms } of UNITS) {
    const value = Math.floor(absDiff / ms);
    if (value >= 1) {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      return rtf.format(isFuture ? value : -value, unit);
    }
  }

  return 'just now';
}
