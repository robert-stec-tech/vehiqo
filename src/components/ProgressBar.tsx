import { View } from 'react-native';

import { getWarningLevel, type WarningLevel } from '@/utils/compliance';

interface ProgressBarProps {
  value: number;
  limit: number;
}

// Fill escalates with the same thresholds as the alert system, so the bar and
// the banners always tell the same story.
const fillColor: Record<WarningLevel, string> = {
  info: 'bg-warning',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export function ProgressBar({ value, limit }: ProgressBarProps) {
  const level = getWarningLevel(value, limit);
  const pct = Math.max(0, Math.min(100, (value / limit) * 100));
  const color = level ? fillColor[level] : 'bg-driving';
  return (
    <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-night-border">
      <View
        className={`h-full rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </View>
  );
}
