import type { WarningLevel } from '@/utils/compliance';

export type AlertSeverity = WarningLevel;

export interface CounterWarnings {
  drivingSinceBreak: WarningLevel | null;
  dailyDriving: WarningLevel | null;
  weeklyDriving: WarningLevel | null;
  biweeklyDriving: WarningLevel | null;
}

export interface CounterPercents {
  drivingSinceBreak: number;
  dailyDriving: number;
  weeklyDriving: number;
  biweeklyDriving: number;
}

type CounterAlertId = keyof CounterWarnings;

export type TimerAlertId = 'breakDueSoon' | CounterAlertId;

type MessageKey =
  | 'workTimer.warnings.breakDueSoon'
  | `workTimer.warnings.${CounterAlertId}.${WarningLevel}`;

export interface TimerAlert {
  id: TimerAlertId;
  severity: AlertSeverity;
  messageKey: MessageKey;
  // Live percentage of the limit reached, shown in the message for the four
  // counter-based alerts. breakDueSoon has no percent — it's a fixed 30-minute
  // pre-alert, not a threshold-based one.
  percent?: number;
}

const COUNTER_ORDER: CounterAlertId[] = [
  'drivingSinceBreak',
  'dailyDriving',
  'weeklyDriving',
  'biweeklyDriving',
];

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
};

// The "break due soon" pre-alert is dropped once driving-since-break hits the
// 100% level: the break is no longer "soon" but mandatory now, so the danger
// message for that counter replaces it instead of showing both.
export function buildTimerAlerts(
  warnings: CounterWarnings,
  percents: CounterPercents,
  isBreakDueSoon: boolean,
): TimerAlert[] {
  const alerts: TimerAlert[] = [];

  if (isBreakDueSoon && warnings.drivingSinceBreak !== 'danger') {
    alerts.push({
      id: 'breakDueSoon',
      severity: 'warning',
      messageKey: 'workTimer.warnings.breakDueSoon',
    });
  }

  for (const id of COUNTER_ORDER) {
    const level = warnings[id];
    if (level !== null) {
      alerts.push({
        id,
        severity: level,
        messageKey: `workTimer.warnings.${id}.${level}`,
        percent: percents[id],
      });
    }
  }

  return alerts.sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
}
