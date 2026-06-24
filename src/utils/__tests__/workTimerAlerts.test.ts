import {
  buildTimerAlerts,
  type CounterWarnings,
} from '@/utils/workTimerAlerts';

const NO_WARNINGS: CounterWarnings = {
  drivingSinceBreak: null,
  dailyDriving: null,
  weeklyDriving: null,
  biweeklyDriving: null,
};

describe('buildTimerAlerts', () => {
  it('returns no alerts when nothing is triggered', () => {
    expect(buildTimerAlerts(NO_WARNINGS, false)).toEqual([]);
  });

  it('builds a counter alert with matching severity and message key', () => {
    const alerts = buildTimerAlerts(
      { ...NO_WARNINGS, dailyDriving: 'info' },
      false,
    );
    expect(alerts).toEqual([
      {
        id: 'dailyDriving',
        severity: 'info',
        messageKey: 'workTimer.warnings.dailyDriving.info',
      },
    ]);
  });

  it('orders alerts most severe first', () => {
    const alerts = buildTimerAlerts(
      {
        drivingSinceBreak: 'info',
        dailyDriving: 'danger',
        weeklyDriving: 'warning',
        biweeklyDriving: null,
      },
      false,
    );
    expect(alerts.map((a) => a.severity)).toEqual([
      'danger',
      'warning',
      'info',
    ]);
    expect(alerts.map((a) => a.id)).toEqual([
      'dailyDriving',
      'weeklyDriving',
      'drivingSinceBreak',
    ]);
  });

  it('adds the break-due-soon pre-alert as a warning', () => {
    const alerts = buildTimerAlerts(NO_WARNINGS, true);
    expect(alerts).toEqual([
      {
        id: 'breakDueSoon',
        severity: 'warning',
        messageKey: 'workTimer.warnings.breakDueSoon',
      },
    ]);
  });

  it('suppresses break-due-soon once driving-since-break reaches danger', () => {
    const alerts = buildTimerAlerts(
      { ...NO_WARNINGS, drivingSinceBreak: 'danger' },
      true,
    );
    expect(alerts.map((a) => a.id)).toEqual(['drivingSinceBreak']);
    expect(alerts[0].severity).toBe('danger');
  });

  it('keeps break-due-soon ahead of a same-severity counter warning', () => {
    const alerts = buildTimerAlerts(
      { ...NO_WARNINGS, drivingSinceBreak: 'warning' },
      true,
    );
    expect(alerts.map((a) => a.id)).toEqual([
      'breakDueSoon',
      'drivingSinceBreak',
    ]);
    expect(alerts.every((a) => a.severity === 'warning')).toBe(true);
  });
});
