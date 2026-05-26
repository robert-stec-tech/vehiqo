import type { WorkMode, WorkSession } from '@/db/types';

// Sums time spent in `mode` that overlaps the [from, to) range.
// Each session is clipped to the range boundaries.
// Ongoing sessions (ended_at null) are treated as ending at `to`.
export function sumModeTimeInRange(
  sessions: WorkSession[],
  mode: WorkMode,
  from: number,
  to: number,
): number {
  let total = 0;
  for (const session of sessions) {
    if (session.mode !== mode) continue;
    const start = Math.max(session.started_at, from);
    const end = Math.min(session.ended_at ?? to, to);
    if (end > start) {
      total += end - start;
    }
  }
  return total;
}
