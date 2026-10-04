import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { databaseName } from '@/database/databaseName';
import { migrateDatabase } from '@/database/migrateDatabase';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { palettes } from '@/theme/tokens';
import { useColorSchemeName } from '@/theme/useColorSchemeName';

export default function RootLayout() {
  const palette = palettes[useColorSchemeName()];

  return (
    <SQLiteProvider databaseName={databaseName} onInit={migrateDatabase}>
      <ThemeProvider>
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
          <Stack.Screen name="index" options={{ title: 'Workouts' }} />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
