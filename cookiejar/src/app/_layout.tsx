import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { databaseName } from '@/database/databaseName';
import { migrateDatabase } from '@/database/migrateDatabase';
import { useNotificationReconciler } from '@/hooks/useNotificationReconciler';
import { useNotificationTapRouting } from '@/hooks/useNotificationTapRouting';
import { useRestAlertScheduling } from '@/hooks/useRestAlertScheduling';
import { configureNotificationHandler } from '@/notifications/notificationHandler';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { NuggieName } from '@/nuggies/NuggieName';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { palettes } from '@/theme/tokens';
import { useColorSchemeName } from '@/theme/useColorSchemeName';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

const defaultLoadingCaption = 'Getting your workouts ready…';

const loadingCaptions: Partial<Record<NuggieName, string>> = {
  sleeping: 'Up late? Warming up…',
  earlyMorning: 'Early bird! Getting ready…',
  workout: defaultLoadingCaption,
};

type DatabaseReadySignalProperties = { onReady: () => void };

function DatabaseReadySignal({ onReady }: DatabaseReadySignalProperties) {
  useSQLiteContext();

  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

function NotificationServices() {
  useNotificationReconciler();
  useNotificationTapRouting();
  useRestAlertScheduling();

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
              <Stack.Screen
                name="exercises/index"
                options={{ title: 'Exercise library', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="exercises/new"
                options={{ presentation: 'modal', title: 'New exercise', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="exercises/[exerciseId]"
                options={{ title: 'Edit exercise', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="profile/edit"
                options={{ presentation: 'modal', title: 'Edit profile', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="profile/apple-health"
                options={{ title: 'Apple Health', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="profile/measurements/index"
                options={{ title: 'Body measurements', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="profile/measurements/new"
                options={{
                  presentation: 'formSheet',
                  title: 'New measurement',
                  sheetAllowedDetents: [0.9],
                  sheetGrabberVisible: true,
                }}
              />
              <Stack.Screen
                name="notifications/index"
                options={{ title: 'Notifications', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="notifications/settings"
                options={{ title: 'Notifications', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="notifications/permission"
                options={{
                  presentation: 'formSheet',
                  headerShown: false,
                  sheetAllowedDetents: [0.55],
                  sheetGrabberVisible: true,
                }}
              />
              <Stack.Screen name="progress/index" options={{ title: 'Progress', headerLargeTitleEnabled: false }} />
              <Stack.Screen
                name="progress/records"
                options={{ title: 'Personal records', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen name="progress/classes" options={{ title: 'Classes', headerLargeTitleEnabled: false }} />
              <Stack.Screen
                name="progress/exercises/[exerciseId]"
                options={{ title: '', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen name="stats/[metric]" options={{ title: '', headerLargeTitleEnabled: false }} />
              <Stack.Screen name="workout/[workoutId]" options={{ title: '', headerLargeTitleEnabled: false }} />
              <Stack.Screen name="workouts" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen
                name="sessions/[sessionId]/index"
                options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="sessions/[sessionId]/finishing"
                options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="sessions/[sessionId]/summary"
                options={{ title: 'Summary', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen
                name="sessions/[sessionId]/link-health-workout"
                options={{
                  presentation: 'formSheet',
                  headerShown: false,
                  sheetAllowedDetents: [0.6, 1],
                  sheetGrabberVisible: true,
                }}
              />
              <Stack.Screen name="exercises/picker" options={{ presentation: 'fullScreenModal', headerShown: false }} />
              <Stack.Screen
                name="plans/new"
                options={{ presentation: 'modal', title: 'New plan', headerLargeTitleEnabled: false }}
              />
              <Stack.Screen name="plans/[planId]" options={{ title: '', headerLargeTitleEnabled: false }} />
              <Stack.Screen
                name="plans/[planId]/add-entry"
                options={{
                  presentation: 'formSheet',
                  headerShown: false,
                  sheetAllowedDetents: [0.75, 1],
                  sheetGrabberVisible: true,
                }}
              />
              <Stack.Screen
                name="plans/[planId]/entry-time"
                options={{
                  presentation: 'formSheet',
                  headerShown: false,
                  sheetAllowedDetents: [0.5],
                  sheetGrabberVisible: true,
                }}
              />
              <Stack.Screen
                name="plans/[planId]/activate"
                options={{
                  presentation: 'formSheet',
                  headerShown: false,
                  sheetAllowedDetents: [0.75],
                  sheetGrabberVisible: true,
                }}
              />
              <Stack.Screen
                name="plans/[planId]/copy-day"
                options={{
                  presentation: 'formSheet',
                  headerShown: false,
                  sheetAllowedDetents: [0.6],
                  sheetGrabberVisible: true,
                }}
              />
            </Stack>
            <NotificationServices />
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
