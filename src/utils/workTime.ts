import {
  REQUIRED_BREAK_MS,
  SPLIT_BREAK_FIRST_MS,
  SPLIT_BREAK_SECOND_MS,
} from '@/constants/euRegulations';
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
// Resets to zero when the driver completes a qualifying break or rest:
//   - a single break of at least 45 min, OR
//   - a split break: a part of at least 15 min followed later by a part of
//     at least 30 min (order required by art. 7), OR
//   - any rest period.
export function getDrivingSinceLastBreak(
  sessions: WorkSession[],
  now: number,
): number {
  const ordered = [...sessions].sort((a, b) => a.started_at - b.started_at);
  let accumulated = 0;
  let pendingFirstBreak = false;

  for (const session of ordered) {
    const duration = (session.ended_at ?? now) - session.started_at;

    if (session.mode === 'rest') {
      accumulated = 0;
      pendingFirstBreak = false;
    } else if (session.mode === 'break') {
      if (duration >= REQUIRED_BREAK_MS) {
        accumulated = 0;
        pendingFirstBreak = false;
      } else if (duration >= SPLIT_BREAK_SECOND_MS && pendingFirstBreak) {
        accumulated = 0;
        pendingFirstBreak = false;
      } else if (duration >= SPLIT_BREAK_FIRST_MS) {
        pendingFirstBreak = true;
      }
    } else if (session.mode === 'driving') {
      accumulated += duration;
    }
  }

  return accumulated;
}

// Returns the end timestamp of the most recent 'rest' session lasting at least
// `minDurationMs`, or null if no qualifying rest is found.
// Ongoing rest sessions are treated as ending at `now`.
export function getLastRestPeriodEnd(
  sessions: WorkSession[],
  minDurationMs: number,
  now: number,
): number | null {
  const ordered = [...sessions].sort((a, b) => b.started_at - a.started_at);
  for (const session of ordered) {
    if (session.mode !== 'rest') continue;
    const end = session.ended_at ?? now;
    if (end - session.started_at >= minDurationMs) return end;
  }
  return null;
}
