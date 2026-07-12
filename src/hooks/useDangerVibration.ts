import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';

import type { TimerAlert } from '@/utils/workTimerAlerts';

const DANGER_VIBRATION_PATTERN_MS = [0, 400, 200, 400];

// Vibrates once when a danger-level alert first appears, not on every
// re-render while it stays active — the driver needs one unmistakable pulse,
// not a buzzing phone for the rest of the drive.
export function useDangerVibration(alerts: TimerAlert[]): void {
  const wasDanger = useRef(false);

  useEffect(() => {
    const isDanger = alerts.some((alert) => alert.severity === 'danger');
    if (isDanger && !wasDanger.current) {
      Vibration.vibrate(DANGER_VIBRATION_PATTERN_MS);
    }
    wasDanger.current = isDanger;
  }, [alerts]);
}
