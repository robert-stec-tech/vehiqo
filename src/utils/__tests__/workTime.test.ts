import type { WorkMode, WorkSession } from '@/db/types';
import {
  getDrivingSinceLastBreak,
  getLastRestPeriodEnd,
  sumModeTimeInRange,
} from '@/utils/workTime';

function session(
  mode: WorkMode,
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

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

describe('sumModeTimeInRange', () => {
  const FROM = 100;
  const TO = 200;

  it('returns 0 for no sessions', () => {
    expect(sumModeTimeInRange([], 'driving', FROM, TO)).toBe(0);
  });

  it('sums a session fully inside the range', () => {
    expect(
      sumModeTimeInRange([session('driving', 120, 150)], 'driving', FROM, TO),
    ).toBe(30);
  });

  it('clips a session that starts before the range', () => {
    expect(
      sumModeTimeInRange([session('driving', 50, 150)], 'driving', FROM, TO),
    ).toBe(50);
  });

  it('clips a session that ends after the range', () => {
    expect(
      sumModeTimeInRange([session('driving', 150, 250)], 'driving', FROM, TO),
    ).toBe(50);
  });

  it('clips a session overhanging both ends', () => {
    expect(
      sumModeTimeInRange([session('driving', 50, 250)], 'driving', FROM, TO),
    ).toBe(100);
  });

  it('treats an ongoing session as ending at `to`', () => {
    expect(
      sumModeTimeInRange([session('driving', 150, null)], 'driving', FROM, TO),
    ).toBe(50);
  });

  it('ignores sessions of a different mode', () => {
    expect(
      sumModeTimeInRange(
        [session('other_work', 120, 150)],
        'driving',
        FROM,
        TO,
      ),
    ).toBe(0);
  });

  it('ignores sessions entirely outside the range', () => {
    expect(
      sumModeTimeInRange([session('driving', 10, 50)], 'driving', FROM, TO),
    ).toBe(0);
  });

  it('sums multiple sessions of the same mode', () => {
    const sessions = [
      session('driving', 100, 120),
      session('driving', 140, 160),
    ];
    expect(sumModeTimeInRange(sessions, 'driving', FROM, TO)).toBe(40);
  });

  it('sums only the requested mode when modes are mixed', () => {
    const sessions = [
      session('driving', 100, 130),
      session('break', 130, 150),
      session('driving', 150, 170),
    ];
    expect(sumModeTimeInRange(sessions, 'driving', FROM, TO)).toBe(50);
  });
});

describe('getDrivingSinceLastBreak', () => {
  it('returns 0 for no sessions', () => {
    expect(getDrivingSinceLastBreak([], 1000)).toBe(0);
  });

  it('returns the duration of a single completed driving session', () => {
    const sessions = [session('driving', 0, 2 * HOUR)];
    expect(getDrivingSinceLastBreak(sessions, 2 * HOUR)).toBe(2 * HOUR);
  });

  it('counts an ongoing driving session up to `now`', () => {
    const sessions = [session('driving', 0, null)];
    expect(getDrivingSinceLastBreak(sessions, 90 * MIN)).toBe(90 * MIN);
  });

  it('resets after a full break of exactly 45 minutes', () => {
    const sessions = [
      session('driving', 0, 2 * HOUR),
      session('break', 2 * HOUR, 2 * HOUR + 45 * MIN),
      session('driving', 2 * HOUR + 45 * MIN, 3 * HOUR + 45 * MIN),
    ];
    expect(getDrivingSinceLastBreak(sessions, 3 * HOUR + 45 * MIN)).toBe(
      1 * HOUR,
    );
  });

  it('does NOT reset after a break shorter than 45 minutes', () => {
    const sessions = [
      session('driving', 0, 2 * HOUR),
      session('break', 2 * HOUR, 2 * HOUR + 44 * MIN),
      session('driving', 2 * HOUR + 44 * MIN, 3 * HOUR + 44 * MIN),
    ];
    expect(getDrivingSinceLastBreak(sessions, 3 * HOUR + 44 * MIN)).toBe(
      3 * HOUR,
    );
  });

  it('resets after a rest period', () => {
    const sessions = [
      session('driving', 0, 3 * HOUR),
      session('rest', 3 * HOUR, 12 * HOUR),
      session('driving', 12 * HOUR, 13 * HOUR),
    ];
    expect(getDrivingSinceLastBreak(sessions, 13 * HOUR)).toBe(1 * HOUR);
  });

  it('treats other work and standby as neither adding nor resetting', () => {
    const sessions = [
      session('driving', 0, 2 * HOUR),
      session('other_work', 2 * HOUR, 3 * HOUR),
      session('standby', 3 * HOUR, 4 * HOUR),
      session('driving', 4 * HOUR, 5 * HOUR),
    ];
    expect(getDrivingSinceLastBreak(sessions, 5 * HOUR)).toBe(3 * HOUR);
  });

  it('sorts unordered sessions before accumulating', () => {
    const sessions = [
      session('driving', 2 * HOUR + 45 * MIN, 3 * HOUR + 45 * MIN),
      session('driving', 0, 2 * HOUR),
      session('break', 2 * HOUR, 2 * HOUR + 45 * MIN),
    ];
    expect(getDrivingSinceLastBreak(sessions, 3 * HOUR + 45 * MIN)).toBe(
      1 * HOUR,
    );
  });

  it('resets after a split break: 15 min then 30 min with driving in between', () => {
    const sessions = [
      session('driving', 0, 2 * HOUR),
      session('break', 2 * HOUR, 2 * HOUR + 15 * MIN),
      session('driving', 2 * HOUR + 15 * MIN, 3 * HOUR + 15 * MIN),
      session('break', 3 * HOUR + 15 * MIN, 3 * HOUR + 45 * MIN),
      session('driving', 3 * HOUR + 45 * MIN, 4 * HOUR + 15 * MIN),
    ];
    expect(getDrivingSinceLastBreak(sessions, 4 * HOUR + 15 * MIN)).toBe(
      30 * MIN,
    );
  });

  it('does not reset when the first split part is shorter than 15 min', () => {
    const sessions = [
      session('driving', 0, 2 * HOUR),
      session('break', 2 * HOUR, 2 * HOUR + 10 * MIN),
      session('driving', 2 * HOUR + 10 * MIN, 3 * HOUR + 10 * MIN),
      session('break', 3 * HOUR + 10 * MIN, 3 * HOUR + 40 * MIN),
      session('driving', 3 * HOUR + 40 * MIN, 4 * HOUR + 10 * MIN),
    ];
    expect(getDrivingSinceLastBreak(sessions, 4 * HOUR + 10 * MIN)).toBe(
      3 * HOUR + 30 * MIN,
    );
  });

  it('does not reset when the second split part is shorter than 30 min', () => {
    const sessions = [
      session('driving', 0, 2 * HOUR),
      session('break', 2 * HOUR, 2 * HOUR + 30 * MIN),
      session('driving', 2 * HOUR + 30 * MIN, 3 * HOUR + 30 * MIN),
      session('break', 3 * HOUR + 30 * MIN, 3 * HOUR + 45 * MIN),
      session('driving', 3 * HOUR + 45 * MIN, 4 * HOUR + 15 * MIN),
    ];
    expect(getDrivingSinceLastBreak(sessions, 4 * HOUR + 15 * MIN)).toBe(
      3 * HOUR + 30 * MIN,
    );
  });
});

describe('getLastRestPeriodEnd', () => {
  const MIN_DURATION = 9 * HOUR; // daily rest minimum

  it('returns null when there are no sessions', () => {
    expect(getLastRestPeriodEnd([], MIN_DURATION, 100 * HOUR)).toBeNull();
  });

  it('returns null when no rest meets the minimum duration', () => {
    const sessions = [session('rest', 0, 8 * HOUR)];
    expect(getLastRestPeriodEnd(sessions, MIN_DURATION, 10 * HOUR)).toBeNull();
  });

  it('returns null when there are only non-rest sessions', () => {
    const sessions = [session('driving', 0, 10 * HOUR)];
    expect(getLastRestPeriodEnd(sessions, MIN_DURATION, 10 * HOUR)).toBeNull();
  });

  it('returns ended_at of a qualifying completed rest', () => {
    const sessions = [session('rest', 0, 11 * HOUR)];
    expect(getLastRestPeriodEnd(sessions, MIN_DURATION, 20 * HOUR)).toBe(
      11 * HOUR,
    );
  });

  it('treats ongoing rest as ending at `now`', () => {
    const sessions = [session('rest', 0, null)];
    const now = 10 * HOUR;
    expect(getLastRestPeriodEnd(sessions, MIN_DURATION, now)).toBe(now);
  });

  it('ongoing rest shorter than minimum returns null', () => {
    const sessions = [session('rest', 0, null)];
    const now = 8 * HOUR;
    expect(getLastRestPeriodEnd(sessions, MIN_DURATION, now)).toBeNull();
  });

  it('returns the most recent qualifying rest, not the earliest', () => {
    const sessions = [
      session('rest', 0, 11 * HOUR),
      session('driving', 11 * HOUR, 14 * HOUR),
      session('rest', 14 * HOUR, 25 * HOUR),
    ];
    expect(getLastRestPeriodEnd(sessions, MIN_DURATION, 30 * HOUR)).toBe(
      25 * HOUR,
    );
  });

  it('skips a short rest before a qualifying one', () => {
    const sessions = [
      session('rest', 0, 11 * HOUR),
      session('rest', 20 * HOUR, 28 * HOUR), // 8h — too short
    ];
    expect(getLastRestPeriodEnd(sessions, MIN_DURATION, 30 * HOUR)).toBe(
      11 * HOUR,
    );
  });

  it('works for weekly rest minimum (24h)', () => {
    const WEEKLY_MIN = 24 * HOUR;
    const sessions = [session('rest', 0, 25 * HOUR)];
    expect(getLastRestPeriodEnd(sessions, WEEKLY_MIN, 30 * HOUR)).toBe(
      25 * HOUR,
    );
  });
});
