import { router, Stack } from 'expo-router';

import { Card } from '@/components/atoms/Card';
import { EmptyState } from '@/components/molecules/EmptyState';
import { List } from '@/components/primitives/List';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useExercises } from '@/hooks/useExercises';

function openNewExercise() {
  router.push('/exercises/new');
}

export default function ExerciseLibraryScreen() {
  const exercises = useExercises();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Touchable onPress={openNewExercise} accessibilityLabel="Add exercise">
              <Typography variant="label" color="accent">
                Add
              </Typography>
            </Touchable>
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
            <Card>
              <Typography variant="label">{exercise.name}</Typography>
            </Card>
          )}
        />
      )}
    </>
  );
}
