import {
  WARN_THRESHOLD_INFO,
  WARN_THRESHOLD_WARNING,
  WARN_THRESHOLD_DANGER,
} from '../constants/euRegulations';

export type WarningLevel = 'info' | 'warning' | 'danger';

export function getWarningLevel(
  elapsedMs: number,
  limitMs: number,
): WarningLevel | null {
  const ratio = elapsedMs / limitMs;
  if (ratio >= WARN_THRESHOLD_DANGER) return 'danger';
  if (ratio >= WARN_THRESHOLD_WARNING) return 'warning';
  if (ratio >= WARN_THRESHOLD_INFO) return 'info';
  return null;
}
