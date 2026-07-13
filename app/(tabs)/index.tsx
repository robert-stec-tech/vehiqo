import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertBanner, Card, ModeButton, Text } from '@/components';
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
      <View className="flex-1 bg-gray-50 dark:bg-night">
        <SafeAreaView className="flex-1 items-center justify-center">
          <Text>{t('common.loading')}</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-night">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="px-4 py-4 gap-6">
          <Card>
            <View className="flex-row items-center gap-2">
              <View
                className={`w-2.5 h-2.5 rounded-full ${currentMode ? modeDot[currentMode] : 'bg-ink-muted'}`}
              />
              <Text variant="caption" className="uppercase">
                {t('workTimer.counters.sinceBreak')}
              </Text>
            </View>
            <Text variant="hero" className="mt-1">
              {formatDuration(counters.drivingSinceBreak)}
            </Text>

            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <Text variant="caption">{t('workTimer.counters.daily')}</Text>
                <Text variant="label">
                  {formatDuration(counters.dailyDriving)}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="caption">{t('workTimer.counters.weekly')}</Text>
                <Text variant="label">
                  {formatDuration(counters.weeklyDriving)}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="caption">
                  {t('workTimer.counters.biweekly')}
                </Text>
                <Text variant="label">
                  {formatDuration(counters.biweeklyDriving)}
                </Text>
              </View>
            </View>
          </Card>

          {alerts.length > 0 && (
            <View className="gap-3">
              {alerts.map((alert) => (
                <AlertBanner key={alert.id} alert={alert} />
              ))}
            </View>
          )}

          <View className="gap-3">
            <View className="flex-row gap-3">
              {renderButton('driving')}
              {renderButton('other_work')}
            </View>
            <View className="flex-row gap-3">
              {renderButton('standby')}
              {renderButton('break')}
            </View>
            <View className="flex-row gap-3">{renderButton('rest')}</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
