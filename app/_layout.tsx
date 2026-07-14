import '../global.css';
import '@/i18n';

import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Appearance, Platform } from 'react-native';

import { getDatabase } from '@/db';

// Dark is the default look, independent of the OS setting — many drivers run
// older phones with no system dark mode, and night driving needs it. A proper
// light/dark/system switch will land with the Settings screen.
// react-native-web's Appearance is read-only — setColorScheme doesn't exist there.
if (Platform.OS !== 'web') {
  Appearance.setColorScheme('dark');
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // getDatabase self-limits on web (the OPFS worker can hang there); on
        // native it resolves normally. Either way we never block the splash.
        await getDatabase();
      } catch (e) {
        // On web this is an expected UI-preview limitation, not a real bug —
        // console.error would trigger RN Web's on-screen LogBox overlay.
        if (Platform.OS === 'web') {
          console.info('SQLite unavailable in web preview:', e);
        } else {
          console.error('DB init failed:', e);
        }
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
