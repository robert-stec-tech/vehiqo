import type { WorkMode, WorkSession } from '@/db/types';
import { getDaySegments } from '@/utils/dayTimeline';

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

const DAY_START = 1000;
const DAY_END = 2000;
const NOW = 3000;

describe('getDaySegments', () => {
  it('returns an empty array for no sessions', () => {
    expect(getDaySegments([], DAY_START, DAY_END, NOW)).toEqual([]);
  });

  it('keeps a session fully inside the day unchanged', () => {
    expect(
      getDaySegments([session('driving', 1200, 1500)], DAY_START, DAY_END, NOW),
    ).toEqual([{ mode: 'driving', start: 1200, end: 1500 }]);
  });

  it('clips a session that starts before the day', () => {
    expect(
      getDaySegments([session('break', 500, 1300)], DAY_START, DAY_END, NOW),
    ).toEqual([{ mode: 'break', start: DAY_START, end: 1300 }]);
  });

  it('clips a session that ends after the day', () => {
    expect(
      getDaySegments([session('rest', 1700, 2500)], DAY_START, DAY_END, NOW),
    ).toEqual([{ mode: 'rest', start: 1700, end: DAY_END }]);
  });

  it('clips a session spanning the whole day to the window', () => {
    expect(
      getDaySegments([session('driving', 500, 2500)], DAY_START, DAY_END, NOW),
    ).toEqual([{ mode: 'driving', start: DAY_START, end: DAY_END }]);
  });

  it('drops a session entirely before the day', () => {
    expect(
      getDaySegments([session('driving', 100, 900)], DAY_START, DAY_END, NOW),
    ).toEqual([]);
  });

  it('drops a session entirely after the day', () => {
    expect(
      getDaySegments([session('driving', 2100, 2500)], DAY_START, DAY_END, NOW),
    ).toEqual([]);
  });

  it('ends an ongoing session at now when now is inside the day', () => {
    const nowInside = 1600;
    expect(
      getDaySegments(
        [session('driving', 1200, null)],
        DAY_START,
        DAY_END,
        nowInside,
      ),
    ).toEqual([{ mode: 'driving', start: 1200, end: nowInside }]);
  });

  it('clamps an ongoing session to the day end when now is past it', () => {
    expect(
      getDaySegments([session('driving', 1200, null)], DAY_START, DAY_END, NOW),
    ).toEqual([{ mode: 'driving', start: 1200, end: DAY_END }]);
  });

  it('sorts segments by start time', () => {
    const segments = getDaySegments(
      [
        session('rest', 1600, 1800),
        session('driving', 1100, 1300),
        session('break', 1300, 1600),
      ],
      DAY_START,
      DAY_END,
      NOW,
    );
    expect(segments.map((s) => s.mode)).toEqual(['driving', 'break', 'rest']);
  });
});
