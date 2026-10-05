import { Stack } from 'expo-router';

import { useTheme } from '@/theme/useTheme';
import { WorkoutEditorProvider } from '@/workouts/WorkoutEditorProvider';

export default function WorkoutBuilderLayout() {
  const theme = useTheme();

  return (
    <WorkoutEditorProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.accent,
          headerTitleStyle: { color: theme.colors.textPrimary },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="new" options={{ title: 'New workout' }} />
        <Stack.Screen name="class-details" options={{ title: 'Class details' }} />
        <Stack.Screen name="editor" />
      </Stack>
    </WorkoutEditorProvider>
  );
}
