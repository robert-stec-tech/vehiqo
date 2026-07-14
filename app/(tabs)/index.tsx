import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import {
  AlertBanner,
  Card,
  ModeButton,
  ProgressBar,
  ScreenContainer,
  Text,
} from '@/components';
import {
  DRIVING_BEFORE_BREAK_MS,
  MAX_BIWEEKLY_DRIVING_MS,
  MAX_DAILY_DRIVING_REGULAR_MS,
  MAX_WEEKLY_DRIVING_MS,
} from '@/constants/euRegulations';
import type { WorkMode } from '@/db/types';
import { useDangerVibration } from '@/hooks/useDangerVibration';
import { useWorkTimer } from '@/hooks/useWorkTimer';
import { formatDuration } from '@/utils/format';

// TODO: shares the mode→color association with ModeButton; extract a single
// source if a third consumer appears.
const modeDot: Record<WorkMode, string> = {
  driving: 'bg-driving',
  other_work: 'bg-other-work',
  standby: 'bg-standby',
  break: 'bg-break',
  rest: 'bg-rest',
};

export default function TimerScreen() {
  const { t } = useTranslation();
  const { currentMode, counters, alerts, isLoading, switchMode } =
    useWorkTimer();

  useDangerVibration(alerts);

  // Derive "remaining" from the elapsed value already floored to whole minutes,
  // so the on-screen counter and remaining time always sum to the exact limit
  // (formatDuration truncates seconds — computing both from the raw value would
  // display e.g. 1:00 + 3:29 instead of 1:00 + 3:30).
  const elapsedToMinute =
    Math.floor(counters.drivingSinceBreak / 60_000) * 60_000;
  const breakRemaining = DRIVING_BEFORE_BREAK_MS - elapsedToMinute;

  const modeLabels: Record<WorkMode, string> = {
    driving: t('workTimer.modes.driving'),
    other_work: t('workTimer.modes.other_work'),
    standby: t('workTimer.modes.standby'),
    break: t('workTimer.modes.break'),
    rest: t('workTimer.modes.rest'),
  };

  const renderButton = (mode: WorkMode) => (
    <ModeButton
      mode={mode}
      label={modeLabels[mode]}
      selected={currentMode === mode}
      onPress={() => {
        void switchMode(mode);
      }}
    />
  );

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Pinned above the scroll so a safety alert and the hero timer can
          never scroll out of view. */}
      <View className="gap-4 px-4 pt-4">
        {alerts.length > 0 && <AlertBanner alert={alerts[0]} />}

        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            <View
              className={`w-2.5 h-2.5 rounded-full ${currentMode ? modeDot[currentMode] : 'bg-ink-muted'}`}
            />
            <Text variant="eyebrow">{t('workTimer.counters.sinceBreak')}</Text>
            <Text variant="caption" className="ml-auto">
              / {formatDuration(DRIVING_BEFORE_BREAK_MS)}
            </Text>
          </View>
          <Text variant="hero">
            {formatDuration(counters.drivingSinceBreak)}
          </Text>
          <Text variant="caption">
            {breakRemaining > 0
              ? t('workTimer.breakRemaining', {
                  time: formatDuration(breakRemaining),
                })
              : t('workTimer.breakRequired')}
          </Text>
          <ProgressBar
            value={counters.drivingSinceBreak}
            limit={DRIVING_BEFORE_BREAK_MS}
          />
        </Card>
      </View>

      {/* Secondary counters, and where future cards (hints, fatigue…) slot in. */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerClassName="px-4 pt-4 gap-4"
      >
        <View className="flex-row gap-3">
          <Card className="flex-1 gap-1.5">
            <Text variant="eyebrow">{t('workTimer.counters.daily')}</Text>
            <Text variant="heading">
              {formatDuration(counters.dailyDriving)}
            </Text>
            <ProgressBar
              value={counters.dailyDriving}
              limit={MAX_DAILY_DRIVING_REGULAR_MS}
            />
            <Text variant="timestamp">
              / {formatDuration(MAX_DAILY_DRIVING_REGULAR_MS)}
            </Text>
          </Card>
          <Card className="flex-1 gap-1.5">
            <Text variant="eyebrow">{t('workTimer.counters.weekly')}</Text>
            <Text variant="heading">
              {formatDuration(counters.weeklyDriving)}
            </Text>
            <ProgressBar
              value={counters.weeklyDriving}
              limit={MAX_WEEKLY_DRIVING_MS}
            />
            <Text variant="timestamp">
              / {formatDuration(MAX_WEEKLY_DRIVING_MS)}
            </Text>
          </Card>
          <Card className="flex-1 gap-1.5">
            <Text variant="eyebrow">{t('workTimer.counters.biweekly')}</Text>
            <Text variant="heading">
              {formatDuration(counters.biweeklyDriving)}
            </Text>
            <ProgressBar
              value={counters.biweeklyDriving}
              limit={MAX_BIWEEKLY_DRIVING_MS}
            />
            <Text variant="timestamp">
              / {formatDuration(MAX_BIWEEKLY_DRIVING_MS)}
            </Text>
          </Card>
        </View>
      </ScrollView>

      <View className="gap-2 px-4 pb-4 pt-4">
        <View className="flex-row">{renderButton('driving')}</View>
        <View className="flex-row gap-2">
          {renderButton('other_work')}
          {renderButton('standby')}
        </View>
        <View className="flex-row gap-2">
          {renderButton('break')}
          {renderButton('rest')}
        </View>
      </View>
    </ScreenContainer>
  );
}
