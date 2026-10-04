import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { databaseName } from '@/database/databaseName';
import { migrateDatabase } from '@/database/migrateDatabase';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { NuggieName } from '@/nuggies/NuggieName';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { palettes } from '@/theme/tokens';
import { useColorSchemeName } from '@/theme/useColorSchemeName';

SplashScreen.preventAutoHideAsync();

const defaultLoadingCaption = 'Getting your workouts ready…';

const loadingCaptions: Partial<Record<NuggieName, string>> = {
  sleeping: 'Up late? Warming up…',
  earlyMorning: 'Early bird! Getting ready…',
  workout: defaultLoadingCaption,
};

type DatabaseReadySignalProperties = {
  onReady: () => void;
};

function DatabaseReadySignal({ onReady }: DatabaseReadySignalProperties) {
  useSQLiteContext();

  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

export default function RootLayout() {
  const palette = palettes[useColorSchemeName()];
  const [loadingNuggie] = useState(() => chooseNuggie({ kind: 'appLoading' }, new Date()));
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(true);

  const handleDatabaseReady = useCallback(() => setIsDatabaseReady(true), []);
  const handleLoadingFinished = useCallback(() => setIsLoadingScreenVisible(false), []);

  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <SQLiteProvider databaseName={databaseName} onInit={migrateDatabase} useSuspense>
          <DatabaseReadySignal onReady={handleDatabaseReady} />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerLargeTitleEnabled: true,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: palette.background },
                headerTintColor: palette.accent,
                headerTitleStyle: { color: palette.textPrimary },
                headerLargeTitleStyle: { color: palette.textPrimary },
                contentStyle: { backgroundColor: palette.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="coach" options={{ presentation: 'modal', title: 'Coach Nuggie' }} />
              <Stack.Screen name="exercises/index" options={{ title: 'Exercise library' }} />
              <Stack.Screen
                name="exercises/new"
                options={{ presentation: 'modal', title: 'New exercise', headerLargeTitleEnabled: false }}
              />
            </Stack>
          </GestureHandlerRootView>
        </SQLiteProvider>
      </Suspense>
      {isLoadingScreenVisible ? (
        <NuggieLoadingScreen
          nuggie={loadingNuggie}
          caption={loadingCaptions[loadingNuggie] ?? defaultLoadingCaption}
          isReady={isDatabaseReady}
          onFinished={handleLoadingFinished}
        />
      ) : null}
    </ThemeProvider>
  );
}
