import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { useExercises } from '@/hooks/useExercises';
import {
  beginExercisePick,
  createExercisePickRequestIdentifier,
  useExercisePickResult,
  type ExercisePickResult,
} from '@/stores/exercisePickerStore';

const coachButtonClearance = 96;

type PickerMode = 'multiple' | 'single';

export default function CreateScreen() {
  const exercises = useExercises();
  const [requestIdentifier, setRequestIdentifier] = useState<string | null>(null);
  const pickResult = useExercisePickResult(requestIdentifier);
  const [lastPickResult, setLastPickResult] = useState<ExercisePickResult | null>(null);

  if (pickResult !== null && pickResult !== lastPickResult) {
    setLastPickResult(pickResult);
  }

  const tryPicker = (mode: PickerMode, excludeExerciseIds: number[]) => {
    const newRequestIdentifier = createExercisePickRequestIdentifier();
    beginExercisePick(newRequestIdentifier);
    setRequestIdentifier(newRequestIdentifier);
    router.push({
      pathname: '/exercises/picker',
      params: {
        requestIdentifier: newRequestIdentifier,
        mode,
        ...(excludeExerciseIds.length > 0 ? { excludeExerciseIds: excludeExerciseIds.join(',') } : {}),
      },
    });
  };

  const exerciseName = (exerciseId: number) =>
    exercises?.find((exercise) => exercise.id === exerciseId)?.name ?? `Exercise ${exerciseId}`;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScreenHeader title="Create" />
        <Box paddingHorizontal="medium" gap="small">
          <Button label="Exercise library" variant="secondary" onPress={() => router.push('/exercises')} />
          <Button label="Try picker" variant="secondary" onPress={() => tryPicker('multiple', [])} />
          <Button label="Try single picker" variant="secondary" onPress={() => tryPicker('single', [])} />
          {lastPickResult ? (
            <>
              <Button
                label="Try picker excluding last pick"
                variant="secondary"
                onPress={() => tryPicker('multiple', lastPickResult.exerciseIds)}
              />
              <Card padding="medium">
                <Box gap="extraSmall">
                  <Typography variant="label">
                    {lastPickResult.asSuperset ? 'Last pick, as a superset' : 'Last pick'}
                  </Typography>
                  {lastPickResult.exerciseIds.map((exerciseId, position) => (
                    <Typography key={exerciseId}>{`${position + 1}. ${exerciseName(exerciseId)}`}</Typography>
                  ))}
                </Box>
              </Card>
            </>
          ) : null}
        </Box>
        <EmptyState title="Coming soon" message="Create arrives in phase 02." />
      </Box>
    </SafeAreaView>
  );
}
