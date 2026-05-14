import { getWarningLevel } from '../compliance';

describe('getWarningLevel', () => {
  const LIMIT = 100;

  it('returns null below 75% of the limit', () => {
    expect(getWarningLevel(0, LIMIT)).toBeNull();
    expect(getWarningLevel(74, LIMIT)).toBeNull();
  });

  it('returns info exactly at 75% threshold', () => {
    expect(getWarningLevel(75, LIMIT)).toBe('info');
  });

  it('returns warning exactly at 90% threshold', () => {
    expect(getWarningLevel(90, LIMIT)).toBe('warning');
  });

  it('returns danger exactly at 100% threshold', () => {
    expect(getWarningLevel(100, LIMIT)).toBe('danger');
  });

  it('returns danger when exceeding the limit', () => {
    expect(getWarningLevel(150, LIMIT)).toBe('danger');
  });
});
