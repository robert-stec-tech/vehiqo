import '../global.css';
import '../src/i18n';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { getDatabase } from '../src/db';

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

  return <Stack screenOptions={{ headerShown: false }} />;
}
