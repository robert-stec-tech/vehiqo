import type { WorkMode, WorkSession } from '@/db/types';

export interface DaySegment {
  mode: WorkMode;
  start: number;
  end: number;
}

// Clips work sessions to a single day window [dayStart, dayEnd) for the daily
// timeline chart. Ongoing sessions (ended_at null) are treated as ending now,
// itself clamped to the window. Sessions with no overlap are dropped; the
// result is sorted by start time.
export function getDaySegments(
  sessions: WorkSession[],
  dayStart: number,
  dayEnd: number,
  now: number,
): DaySegment[] {
  const segments: DaySegment[] = [];
  for (const session of sessions) {
    const start = Math.max(session.started_at, dayStart);
    const end = Math.min(session.ended_at ?? now, dayEnd);
    if (end > start) {
      segments.push({ mode: session.mode, start, end });
    }
  }
  return segments.sort((a, b) => a.start - b.start);
}

export interface DayBounds {
  dayStart: number;
  dayEnd: number;
}

// Local-calendar-day window containing `now`, for the daily timeline chart.
export function getDayBounds(now: number): DayBounds {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const dayStart = start.getTime();
  return { dayStart, dayEnd: dayStart + 24 * 60 * 60 * 1000 };
}
