import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { FormField } from '@/components/molecules/FormField';
import { KindChoiceCard } from '@/components/molecules/KindChoiceCard';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import type { WorkoutKind } from '@/types/WorkoutKind';
import { workoutNameError } from '@/workouts/workoutNameError';

export default function NewWorkoutScreen() {
  const { state, dispatch } = useWorkoutEditor();
  useUnsavedChangesGuard(state.hasUnsavedChanges);
  const [selectedKind, setSelectedKind] = useState<WorkoutKind | null>(null);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
  const nameError = workoutNameError(state.name);

  const goNext = () => {
    setHasAttemptedNext(true);
    if (nameError !== null || selectedKind === null) {
      return;
    }
    dispatch({ type: 'kindChosen', kind: selectedKind });
    if (selectedKind === 'class') {
      router.push('/workouts/class-details');
      return;
    }
    if (selectedKind === 'activity') {
      router.push('/workouts/activity-details');
      return;
    }
    if (selectedKind === 'swim') {
      router.push('/workouts/swim-editor');
      return;
    }
    router.push({ pathname: '/workouts/editor', params: { pickOnOpen: 'true' } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <TextButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => <TextButton label="Next" onPress={goNext} />,
        }}
      />
      <ScrollBox gap="large">
        <FormField label="Name" error={hasAttemptedNext ? (nameError ?? undefined) : undefined}>
          <TextField
            value={state.name}
            onChangeText={(name) => dispatch({ type: 'renamed', name })}
            placeholder="e.g. Push Day"
            autoCapitalize="words"
            autoFocus
            returnKeyType="done"
            accessibilityLabel="Name"
          />
        </FormField>
        <FormField
          label="Type"
          error={hasAttemptedNext && selectedKind === null ? 'Choose Individual, Class, Activity or Swim' : undefined}
        >
          <KindChoiceCard
            title="Individual workout"
            description="Pick exercises, sets and reps"
            nuggie="workout"
            isSelected={selectedKind === 'individual'}
            onPress={() => setSelectedKind('individual')}
          />
          <KindChoiceCard
            title="Class"
            description="Yoga, pilates, spin and more"
            nuggie="yoga"
            isSelected={selectedKind === 'class'}
            onPress={() => setSelectedKind('class')}
          />
          <KindChoiceCard
            title="Activity"
            description="Hike, run or walk"
            nuggie="hiking"
            isSelected={selectedKind === 'activity'}
            onPress={() => setSelectedKind('activity')}
          />
          <KindChoiceCard
            title="Swim"
            description="Sections of sets with strokes, distances and rests"
            nuggie="shark"
            isSelected={selectedKind === 'swim'}
            onPress={() => setSelectedKind('swim')}
          />
        </FormField>
      </ScrollBox>
    </>
  );
}
