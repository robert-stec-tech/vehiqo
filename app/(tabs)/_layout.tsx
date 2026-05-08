import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.timer'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="timer-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="daily-check"
        options={{
          title: t('tabs.dailyCheck'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkbox-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fatigue"
        options={{
          title: t('tabs.fatigue'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="battery-half-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
