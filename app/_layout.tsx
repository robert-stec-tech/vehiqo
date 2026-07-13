import '../global.css';
import '@/i18n';

import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import { getDatabase } from '@/db';

// Dark is the default look, independent of the OS setting — many drivers run
// older phones with no system dark mode, and night driving needs it. A proper
// light/dark/system switch will land with the Settings screen.
Appearance.setColorScheme('dark');

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await getDatabase();
      } catch (e) {
        console.error('DB init failed:', e);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
