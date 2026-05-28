import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BREAK_PRE_ALERT_BEFORE_LIMIT_MS,
  DRIVING_BEFORE_BREAK_MS,
  MAX_BIWEEKLY_DRIVING_MS,
  MAX_DAILY_DRIVING_REGULAR_MS,
  MAX_WEEKLY_DRIVING_MS,
} from '@/constants/euRegulations';
import {
  getCurrentWorkSession,
  getWorkSessionsInRange,
  getWorkTimerSettings,
  startWorkSession,
} from '@/db/queries';
import type { WorkMode, WorkSession } from '@/db/types';
import { getWarningLevel, type WarningLevel } from '@/utils/compliance';
import { getDrivingSinceLastBreak, sumModeTimeInRange } from '@/utils/workTime';

const HOUR_MS = 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * 24 * HOUR_MS;
const TICK_INTERVAL_MS = 30_000;

export interface WorkTimerCounters {
  drivingSinceBreak: number;
  dailyDriving: number;
  weeklyDriving: number;
  biweeklyDriving: number;
}

export interface WorkTimerWarnings {
  drivingSinceBreak: WarningLevel | null;
  dailyDriving: WarningLevel | null;
  weeklyDriving: WarningLevel | null;
  biweeklyDriving: WarningLevel | null;
}

export interface UseWorkTimerReturn {
  currentMode: WorkMode | null;
  counters: WorkTimerCounters;
  warnings: WorkTimerWarnings;
  isBreakDueSoon: boolean;
  isLoading: boolean;
  switchMode: (mode: WorkMode) => Promise<void>;
}

export function computeCounters(
  sessions: WorkSession[],
  now: number,
  lastDailyRestEnd: number | null,
  lastWeeklyRestEnd: number | null,
): WorkTimerCounters {
  const dailyStart = lastDailyRestEnd ?? 0;
  const weeklyStart = lastWeeklyRestEnd ?? 0;
  // EU art. 6(3): max 90h over any two consecutive calendar weeks.
  // Approximated as a rolling 14-day window for V1.
  const biweeklyStart = now - TWO_WEEKS_MS;

  return {
    drivingSinceBreak: getDrivingSinceLastBreak(sessions, now),
    dailyDriving: sumModeTimeInRange(sessions, 'driving', dailyStart, now),
    weeklyDriving: sumModeTimeInRange(sessions, 'driving', weeklyStart, now),
    biweeklyDriving: sumModeTimeInRange(
      sessions,
      'driving',
      biweeklyStart,
      now,
    ),
  };
}

function computeWarnings(counters: WorkTimerCounters): WorkTimerWarnings {
  return {
    drivingSinceBreak: getWarningLevel(
      counters.drivingSinceBreak,
      DRIVING_BEFORE_BREAK_MS,
    ),
    dailyDriving: getWarningLevel(
      counters.dailyDriving,
      MAX_DAILY_DRIVING_REGULAR_MS,
    ),
    weeklyDriving: getWarningLevel(
      counters.weeklyDriving,
      MAX_WEEKLY_DRIVING_MS,
    ),
    biweeklyDriving: getWarningLevel(
      counters.biweeklyDriving,
      MAX_BIWEEKLY_DRIVING_MS,
    ),
  };
}

export function useWorkTimer(): UseWorkTimerReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<WorkMode | null>(null);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [lastDailyRestEnd, setLastDailyRestEnd] = useState<number | null>(null);
  const [lastWeeklyRestEnd, setLastWeeklyRestEnd] = useState<number | null>(
    null,
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    async function load() {
      const lookbackStart = Date.now() - TWO_WEEKS_MS;
      const [current, historical, settings] = await Promise.all([
        getCurrentWorkSession(),
        getWorkSessionsInRange(lookbackStart, Date.now()),
        getWorkTimerSettings(),
      ]);
      setCurrentMode(current?.mode ?? null);
      setSessions(historical);
      setLastDailyRestEnd(settings.lastDailyRestEnd);
      setLastWeeklyRestEnd(settings.lastWeeklyRestEnd);
      setIsLoading(false);
    }
    void load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const counters = useMemo(
    () => computeCounters(sessions, now, lastDailyRestEnd, lastWeeklyRestEnd),
    [sessions, now, lastDailyRestEnd, lastWeeklyRestEnd],
  );
  const warnings = useMemo(() => computeWarnings(counters), [counters]);

  const isBreakDueSoon =
    counters.drivingSinceBreak >=
    DRIVING_BEFORE_BREAK_MS - BREAK_PRE_ALERT_BEFORE_LIMIT_MS;

  const switchMode = useCallback(
    async (mode: WorkMode) => {
      const newSession = await startWorkSession(mode);
      const closeTime = newSession.started_at;

      setCurrentMode(mode);
      setSessions((prev) => [
        ...prev.map((s) =>
          s.ended_at === null
            ? { ...s, ended_at: closeTime, updated_at: closeTime }
            : s,
        ),
        newSession,
      ]);
      setNow(Date.now());

      // startWorkSession may have updated app_settings if we just left a rest
      // period — reload so the counters anchor to the new rest end immediately.
      if (currentMode === 'rest') {
        const settings = await getWorkTimerSettings();
        setLastDailyRestEnd(settings.lastDailyRestEnd);
        setLastWeeklyRestEnd(settings.lastWeeklyRestEnd);
      }
    },
    [currentMode],
  );

  return {
    currentMode,
    counters,
    warnings,
    isBreakDueSoon,
    isLoading,
    switchMode,
  };
}
