import { sumModeTimeInRange } from '@/utils/workTime';
import type { WorkSession, WorkMode } from '@/db/types';

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
