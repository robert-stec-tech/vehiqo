import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.timer'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="daily-check"
        options={{
          title: t('tabs.dailyCheck'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="map-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fatigue"
        options={{
          title: t('tabs.fatigue'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="head-alert-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
