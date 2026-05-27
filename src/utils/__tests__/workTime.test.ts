import type { WorkMode, WorkSession } from '@/db/types';
import { getDrivingSinceLastBreak, sumModeTimeInRange } from '@/utils/workTime';

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
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;

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
});
