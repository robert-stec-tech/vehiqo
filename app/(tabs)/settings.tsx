import { useTranslation } from 'react-i18next';
import { Alert, Text as RNText, TouchableOpacity, View } from 'react-native';

import { ScreenContainer, Text } from '@/components';
import { clearAllLocalData } from '@/db/queries';

// Dev-only: lets a developer wipe locally stored data (stale test sessions,
// bad counter states) without uninstalling Expo Go. __DEV__ is compiled to a
// static `false` in production builds, so Metro's minifier removes this
// entire block — it never reaches a real driver's build.
function DevTools() {
  const handleClear = () => {
    Alert.alert(
      'Clear all local data?',
      'This permanently deletes every work session, daily check, and fatigue record stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllLocalData();
            Alert.alert(
              'Done',
              'All local data has been cleared. Reload the app to see the change.',
            );
          },
        },
      ],
    );
  };

  return (
    <View className="w-full gap-2 rounded-2xl border border-danger/30 bg-danger/5 p-4">
      <RNText className="text-sm font-bold uppercase tracking-wide text-danger">
        Developer tools
      </RNText>
      <TouchableOpacity
        className="items-center rounded-xl bg-danger px-6 py-4 active:opacity-80"
        onPress={handleClear}
      >
        <RNText className="text-base font-semibold text-white">
          Clear all local data
        </RNText>
      </TouchableOpacity>
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <ScreenContainer className="items-center gap-6 px-4 pt-8">
      <Text variant="heading">{t('tabs.settings')}</Text>
      {__DEV__ && <DevTools />}
    </ScreenContainer>
  );
}
