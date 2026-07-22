import type { WorkSession } from '@/db/types';
import { computeCounters } from '@/hooks/useWorkTimer';

jest.mock('@/db/queries', () => ({
  getCurrentWorkSession: jest.fn(),
  getWorkSessionsInRange: jest.fn(),
  getWorkTimerSettings: jest.fn(),
  startWorkSession: jest.fn(),
}));

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;

function session(
  mode: WorkSession['mode'],
  started_at: number,
  ended_at: number | null,
): WorkSession {
  return {
    id: 'test',
    mode,
    started_at,
    ended_at,
    created_at: started_at,
    updated_at: started_at,
    synced_at: null,
  };
}

describe('computeCounters — drivingSinceBreak', () => {
  it('returns 0 with no sessions', () => {
    const { drivingSinceBreak } = computeCounters([], 10 * HOUR, null, null);
    expect(drivingSinceBreak).toBe(0);
  });

  it('counts ongoing driving session', () => {
    const sessions = [session('driving', 0, null)];
    const { drivingSinceBreak } = computeCounters(
      sessions,
      2 * HOUR,
      null,
      null,
    );
    expect(drivingSinceBreak).toBe(2 * HOUR);
  });

  it('resets after a 45-min break', () => {
    const sessions = [
      session('driving', 0, 4 * HOUR),
      session('break', 4 * HOUR, 4 * HOUR + 45 * MIN),
      session('driving', 4 * HOUR + 45 * MIN, null),
    ];
    const now = 4 * HOUR + 45 * MIN + HOUR;
    const { drivingSinceBreak } = computeCounters(sessions, now, null, null);
    expect(drivingSinceBreak).toBe(HOUR);
  });

  it('standby and other_work do not add to drivingSinceBreak', () => {
    const sessions = [
      session('driving', 0, HOUR),
      session('standby', HOUR, 2 * HOUR),
      session('other_work', 2 * HOUR, 3 * HOUR),
      session('driving', 3 * HOUR, null),
    ];
    const { drivingSinceBreak } = computeCounters(
      sessions,
      4 * HOUR,
      null,
      null,
    );
    expect(drivingSinceBreak).toBe(2 * HOUR);
  });
});

describe('computeCounters — dailyDriving', () => {
  // 2026-06-17 is a Wednesday, inside the Mon 15 – Sun 21 June calendar week.
  const WED_NOON = new Date(2026, 5, 17, 12, 0, 0).getTime();

  it('falls back to the start of the calendar day, not the epoch', () => {
    const sessions = [
      session(
        'driving',
        new Date(2026, 5, 16, 9, 0, 0).getTime(),
        new Date(2026, 5, 16, 14, 0, 0).getTime(),
      ),
      session(
        'driving',
        new Date(2026, 5, 17, 8, 0, 0).getTime(),
        new Date(2026, 5, 17, 10, 0, 0).getTime(),
      ),
    ];
    const { dailyDriving } = computeCounters(sessions, WED_NOON, null, null);
    expect(dailyDriving).toBe(2 * HOUR);
  });

  it('clips a session that started before midnight to the current day', () => {
    const sessions = [
      session(
        'driving',
        new Date(2026, 5, 16, 22, 0, 0).getTime(),
        new Date(2026, 5, 17, 3, 0, 0).getTime(),
      ),
    ];
    const { dailyDriving } = computeCounters(sessions, WED_NOON, null, null);
    expect(dailyDriving).toBe(3 * HOUR);
  });

  it('honours a recorded rest end that precedes midnight', () => {
    const restEnd = new Date(2026, 5, 16, 20, 0, 0).getTime();
    const sessions = [
      session('driving', restEnd, new Date(2026, 5, 17, 1, 0, 0).getTime()),
    ];
    const { dailyDriving } = computeCounters(sessions, WED_NOON, restEnd, null);
    expect(dailyDriving).toBe(5 * HOUR);
  });

  it('counts only driving after lastDailyRestEnd', () => {
    const sessions = [
      session('driving', 0, 3 * HOUR),
      session('rest', 3 * HOUR, 14 * HOUR),
      session('driving', 14 * HOUR, 16 * HOUR),
    ];
    const { dailyDriving } = computeCounters(
      sessions,
      16 * HOUR,
      14 * HOUR,
      null,
    );
    expect(dailyDriving).toBe(2 * HOUR);
  });

  it('excludes driving before lastDailyRestEnd', () => {
    const sessions = [
      session('driving', 0, 3 * HOUR),
      session('driving', 20 * HOUR, 22 * HOUR),
    ];
    const { dailyDriving } = computeCounters(
      sessions,
      22 * HOUR,
      14 * HOUR,
      null,
    );
    expect(dailyDriving).toBe(2 * HOUR);
  });

  it('counts an ongoing driving session up to now', () => {
    const sessions = [session('driving', 14 * HOUR, null)];
    const { dailyDriving } = computeCounters(
      sessions,
      16 * HOUR,
      14 * HOUR,
      null,
    );
    expect(dailyDriving).toBe(2 * HOUR);
  });
});

describe('computeCounters — weeklyDriving', () => {
  it('falls back to the start of the calendar week, not the epoch', () => {
    // Mon 15 Jun 2026 starts the week; the Sunday before it must be excluded.
    const sessions = [
      session(
        'driving',
        new Date(2026, 5, 14, 9, 0, 0).getTime(),
        new Date(2026, 5, 14, 17, 0, 0).getTime(),
      ),
      session(
        'driving',
        new Date(2026, 5, 16, 9, 0, 0).getTime(),
        new Date(2026, 5, 16, 13, 0, 0).getTime(),
      ),
    ];
    const now = new Date(2026, 5, 17, 12, 0, 0).getTime();
    const { weeklyDriving } = computeCounters(sessions, now, null, null);
    expect(weeklyDriving).toBe(4 * HOUR);
  });

  it('weekly counter does not reset on calendar week boundary', () => {
    // Weekly rest ended on Wednesday — counter runs from there, not from Monday.
    const WED = 3 * 24 * HOUR;
    const sessions = [
      session('driving', 0, 24 * HOUR),
      session('rest', 24 * HOUR, WED),
      session('driving', WED, WED + 30 * HOUR),
    ];
    const { weeklyDriving } = computeCounters(
      sessions,
      WED + 30 * HOUR,
      null,
      WED,
    );
    expect(weeklyDriving).toBe(30 * HOUR);
  });

  it('counts only driving after lastWeeklyRestEnd', () => {
    const sessions = [
      session('driving', 0, 5 * HOUR),
      session('driving', 50 * HOUR, 56 * HOUR),
    ];
    const { weeklyDriving } = computeCounters(
      sessions,
      56 * HOUR,
      null,
      48 * HOUR,
    );
    expect(weeklyDriving).toBe(6 * HOUR);
  });
});

describe('computeCounters — biweeklyDriving', () => {
  // Weeks run Mon–Sun. For Wed 17 Jun 2026 the legal window is the current week
  // (from Mon 15 Jun) plus the previous one (from Mon 8 Jun).
  const WED_NOON = new Date(2026, 5, 17, 12, 0, 0).getTime();

  it('spans the current and previous calendar week only', () => {
    const sessions = [
      // Fri 5 Jun — two weeks back, outside the window.
      session(
        'driving',
        new Date(2026, 5, 5, 9, 0, 0).getTime(),
        new Date(2026, 5, 5, 16, 0, 0).getTime(),
      ),
      // Wed 10 Jun — previous week, inside.
      session(
        'driving',
        new Date(2026, 5, 10, 9, 0, 0).getTime(),
        new Date(2026, 5, 10, 15, 0, 0).getTime(),
      ),
      // Tue 16 Jun — current week, inside.
      session(
        'driving',
        new Date(2026, 5, 16, 9, 0, 0).getTime(),
        new Date(2026, 5, 16, 13, 0, 0).getTime(),
      ),
    ];
    const { biweeklyDriving } = computeCounters(sessions, WED_NOON, null, null);
    expect(biweeklyDriving).toBe(10 * HOUR);
  });

  it('excludes a rolling-14-day session that falls in a third week', () => {
    // Wed 3 Jun is within 14 days of Wed 17 Jun, but belongs to the week of
    // Mon 1 Jun — a third calendar week, so it must not count.
    const sessions = [
      session(
        'driving',
        new Date(2026, 5, 3, 9, 0, 0).getTime(),
        new Date(2026, 5, 3, 17, 0, 0).getTime(),
      ),
    ];
    const { biweeklyDriving } = computeCounters(sessions, WED_NOON, null, null);
    expect(biweeklyDriving).toBe(0);
  });

  it('clips a session that straddles the window start', () => {
    // Sun 7 Jun 22:00 → Mon 8 Jun 02:00; only the part from Monday counts.
    const sessions = [
      session(
        'driving',
        new Date(2026, 5, 7, 22, 0, 0).getTime(),
        new Date(2026, 5, 8, 2, 0, 0).getTime(),
      ),
    ];
    const { biweeklyDriving } = computeCounters(sessions, WED_NOON, null, null);
    expect(biweeklyDriving).toBe(2 * HOUR);
  });
});
