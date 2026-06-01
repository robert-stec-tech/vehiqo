import { formatDuration } from '@/utils/format';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

describe('formatDuration', () => {
  it('formats zero as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('formats whole minutes under an hour', () => {
    expect(formatDuration(45 * MIN)).toBe('00:45');
  });

  it('formats hours and minutes together', () => {
    expect(formatDuration(4 * HOUR + 30 * MIN)).toBe('04:30');
  });

  it('does not cap hours at 24', () => {
    expect(formatDuration(56 * HOUR)).toBe('56:00');
    expect(formatDuration(90 * HOUR)).toBe('90:00');
  });

  it('truncates leftover seconds toward the lower minute', () => {
    expect(formatDuration(2 * MIN + 59 * 1000)).toBe('00:02');
  });

  it('clamps negative input to 00:00', () => {
    expect(formatDuration(-5 * MIN)).toBe('00:00');
  });

  it('truncates 89 999 ms to 00:01, not 00:02', () => {
    expect(formatDuration(89_999)).toBe('00:01');
  });
});
