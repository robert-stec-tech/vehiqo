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
  it('counts all driving when lastDailyRestEnd is null (fallback to 0)', () => {
    const sessions = [
      session('driving', 2 * HOUR, 4 * HOUR),
      session('driving', 6 * HOUR, 8 * HOUR),
    ];
    const { dailyDriving } = computeCounters(sessions, 10 * HOUR, null, null);
    expect(dailyDriving).toBe(4 * HOUR);
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
  it('counts all driving when lastWeeklyRestEnd is null (fallback to 0)', () => {
    const sessions = [session('driving', 0, 10 * HOUR)];
    const { weeklyDriving } = computeCounters(sessions, 10 * HOUR, null, null);
    expect(weeklyDriving).toBe(10 * HOUR);
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
  const TWO_WEEKS = 14 * 24 * HOUR;

  it('counts only driving within the rolling 14-day window', () => {
    const now = 20 * 24 * HOUR;
    const windowStart = now - TWO_WEEKS;
    const sessions = [
      session('driving', 0, 24 * HOUR),
      session('driving', windowStart + HOUR, windowStart + 6 * HOUR),
    ];
    const { biweeklyDriving } = computeCounters(sessions, now, null, null);
    expect(biweeklyDriving).toBe(5 * HOUR);
  });

  it('clips a driving session that straddles the window start', () => {
    const now = 20 * 24 * HOUR;
    const windowStart = now - TWO_WEEKS;
    const sessions = [
      session('driving', windowStart - 2 * HOUR, windowStart + 3 * HOUR),
    ];
    const { biweeklyDriving } = computeCounters(sessions, now, null, null);
    expect(biweeklyDriving).toBe(3 * HOUR);
  });
});
