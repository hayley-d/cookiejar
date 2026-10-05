import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExercisePicker } from '@/components/organisms/ExercisePicker';
import { useExercises } from '@/hooks/useExercises';

function openNewExercise() {
  router.push('/exercises/new');
}

function openExercise(exerciseId: number) {
  router.push({ pathname: '/exercises/[exerciseId]', params: { exerciseId: String(exerciseId) } });
}

export default function ExerciseLibraryScreen() {
  const exercises = useExercises();
  const [searchText, setSearchText] = useState('');

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TextButton label="Add" accessibilityLabel="Add exercise" onPress={openNewExercise} />
          ),
        }}
      />
      {exercises === null ? null : exercises.length === 0 ? (
        <EmptyState
          nuggie="workout"
          title="Exercise library"
          message="No exercises yet — add your first one!"
          actionLabel="Add exercise"
          onAction={openNewExercise}
        />
      ) : (
        <ExercisePicker
          variant="browse"
          exercises={exercises}
          searchText={searchText}
          onChangeSearchText={setSearchText}
          onPressExercise={openExercise}
        />
      )}
    </>
  );
}
