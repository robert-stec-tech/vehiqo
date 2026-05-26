import { REQUIRED_BREAK_MS } from '@/constants/euRegulations';
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

// Accumulated driving time since the last qualifying break or rest.
// A full break (>= 45 min) or any rest period resets the counter to zero.
// Other work, standby and short stops neither add to nor reset the counter.
// NOTE: split break (15 + 30 min) is not handled here — both segments are
// treated as short breaks that do not reset. To be refined separately.
export function getDrivingSinceLastBreak(
  sessions: WorkSession[],
  now: number,
): number {
  const ordered = [...sessions].sort((a, b) => a.started_at - b.started_at);
  let accumulated = 0;

  for (const session of ordered) {
    const duration = (session.ended_at ?? now) - session.started_at;
    if (session.mode === 'rest') {
      accumulated = 0;
    } else if (session.mode === 'break' && duration >= REQUIRED_BREAK_MS) {
      accumulated = 0;
    } else if (session.mode === 'driving') {
      accumulated += duration;
    }
  }

  return accumulated;
}
