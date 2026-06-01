// Formats a duration in milliseconds as HH:MM (e.g. 4.5h → "04:30").
// Drivers count minutes, so we always show HH:MM and never "2h 15m" prose.
// Hours are not capped at 24 — weekly/biweekly counters legitimately exceed it
// (e.g. 56h → "56:00"). Seconds are truncated, negatives clamped to zero.
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
}
