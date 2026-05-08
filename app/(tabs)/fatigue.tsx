import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function FatigueScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-900 dark:text-white text-2xl font-bold">
          {t('tabs.fatigue')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
