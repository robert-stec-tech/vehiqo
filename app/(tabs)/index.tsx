import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, ModeButton, Text } from '@/components';
import type { WorkMode } from '@/db/types';
import { useWorkTimer } from '@/hooks/useWorkTimer';
import { formatDuration } from '@/utils/format';

export default function TimerScreen() {
  const { t } = useTranslation();
  const { currentMode, counters, isLoading, switchMode } = useWorkTimer();

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
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView contentContainerClassName="px-4 py-4 gap-6">
        <Card>
          <Text variant="caption">{t('workTimer.counters.sinceBreak')}</Text>
          <Text variant="display">
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
              <Text variant="caption">{t('workTimer.counters.biweekly')}</Text>
              <Text variant="label">
                {formatDuration(counters.biweeklyDriving)}
              </Text>
            </View>
          </View>
        </Card>

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
  );
}
