import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MODE_COLORS } from '@/constants/modeColors';
import type { DayBounds, DaySegment } from '@/utils/dayTimeline';

import { Card } from './Card';
import { Text } from './Text';

interface DayTimelineBarProps {
  segments: DaySegment[];
  bounds: DayBounds;
}

const HOUR_MARKS = [0, 6, 12, 18, 24];

export function DayTimelineBar({ segments, bounds }: DayTimelineBarProps) {
  const { t } = useTranslation();
  const dayLengthMs = bounds.dayEnd - bounds.dayStart;

  return (
    <Card className="gap-2">
      <Text variant="eyebrow">{t('workTimer.dayTimeline.title')}</Text>

      {/* Segments are absolutely positioned by percentage (not flex-row) so
          gaps in the data — periods with no logged session — correctly show
          as empty background instead of being squeezed out. */}
      <View className="relative h-6 overflow-hidden rounded-lg bg-gray-100 dark:bg-night-elevated">
        {segments.map((segment, index) => (
          <View
            key={index}
            className={`absolute inset-y-0 ${MODE_COLORS[segment.mode].bg}`}
            style={{
              left: `${((segment.start - bounds.dayStart) / dayLengthMs) * 100}%`,
              width: `${((segment.end - segment.start) / dayLengthMs) * 100}%`,
            }}
          />
        ))}
      </View>

      <View className="flex-row justify-between">
        {HOUR_MARKS.map((hour) => (
          <Text key={hour} variant="timestamp">
            {String(hour).padStart(2, '0')}
          </Text>
        ))}
      </View>
    </Card>
  );
}
