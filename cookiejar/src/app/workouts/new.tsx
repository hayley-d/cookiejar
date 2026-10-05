import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { FormField } from '@/components/molecules/FormField';
import { KindChoiceCard } from '@/components/molecules/KindChoiceCard';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import type { WorkoutKind } from '@/types/WorkoutKind';
import { workoutNameError } from '@/workouts/workoutNameError';

export default function NewWorkoutScreen() {
  const { state, dispatch } = useWorkoutEditor();
  const [selectedKind, setSelectedKind] = useState<WorkoutKind | null>(null);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
  const nameError = workoutNameError(state.name);

  const goNext = () => {
    setHasAttemptedNext(true);
    if (nameError !== null || selectedKind === null) {
      return;
    }
    dispatch({ type: 'kindChosen', kind: selectedKind });
    router.push(selectedKind === 'class' ? '/workouts/class-details' : '/workouts/editor');
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
          error={hasAttemptedNext && selectedKind === null ? 'Choose Individual or Class' : undefined}
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
        </FormField>
      </ScrollBox>
    </>
  );
}
