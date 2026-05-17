import { getWarningLevel, isExtendedDailyDrivingAllowed } from '../compliance';

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

describe('isExtendedDailyDrivingAllowed', () => {
  it('allows extension when no extended drives have been used', () => {
    expect(isExtendedDailyDrivingAllowed(0)).toBe(true);
  });

  it('allows extension when one extended drive has been used', () => {
    expect(isExtendedDailyDrivingAllowed(1)).toBe(true);
  });

  it('disallows extension after the second extended drive', () => {
    expect(isExtendedDailyDrivingAllowed(2)).toBe(false);
  });

  it('disallows extension when already over the limit', () => {
    expect(isExtendedDailyDrivingAllowed(3)).toBe(false);
  });
});
