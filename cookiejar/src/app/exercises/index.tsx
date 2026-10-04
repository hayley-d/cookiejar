import { router, Stack } from 'expo-router';

import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseRow } from '@/components/molecules/ExerciseRow';
import { List } from '@/components/primitives/List';
import { useExercises } from '@/hooks/useExercises';

function openNewExercise() {
  router.push('/exercises/new');
}

function openExercise(exerciseId: number) {
  router.push({ pathname: '/exercises/[exerciseId]', params: { exerciseId: String(exerciseId) } });
}

export default function ExerciseLibraryScreen() {
  const exercises = useExercises();

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
        <List
          data={exercises}
          keyExtractor={(exercise) => String(exercise.id)}
          renderItem={({ item: exercise }) => (
            <ExerciseRow
              name={exercise.name}
              imageUrl={exercise.imageUrl}
              onPress={() => openExercise(exercise.id)}
            />
          )}
        />
      )}
    </>
  );
}
