/** Converts milliseconds to seconds. */
export const msToSeconds = (ms: number): number => ms / 1000;

/** Converts seconds to milliseconds. */
export const secondsToMs = (s: number): number => s * 1000;

/**
 * Formats an incident lifetime into a compact human-readable label.
 *
 * Returns `null` when the incident is still open.
 */
export const formatDuration = (startedAt: string, resolvedAt: string | null) => {
  if (!resolvedAt) return null;
  const ms = new Date(resolvedAt).getTime() - new Date(startedAt).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};