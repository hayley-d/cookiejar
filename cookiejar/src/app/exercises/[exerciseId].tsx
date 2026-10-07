import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseForm } from '@/components/organisms/ExerciseForm';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { deleteExercise, updateExercise, type ExerciseChanges } from '@/database/repositories/exerciseRepository';
import { useExercise } from '@/hooks/useExercise';
import { useExerciseForm } from '@/hooks/useExerciseForm';
import type { Exercise } from '@/types/Exercise';

type EditExerciseProperties = {
  exercise: Exercise;
  usageCount: number;
};

function EditExercise({ exercise, usageCount }: EditExerciseProperties) {
  const database = useSQLiteContext();
  const isInUse = usageCount > 0;

  async function saveExercise(changes: ExerciseChanges) {
    await updateExercise(database, exercise.id, changes);
    router.back();
  }

  const exerciseForm = useExerciseForm({
    initialValues: {
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      defaultTrackingType: exercise.defaultTrackingType,
      imageUrl: exercise.imageUrl ?? '',
      notes: exercise.notes ?? '',
    },
    editingExerciseId: exercise.id,
    saveExercise,
  });

  function confirmDelete() {
    Alert.alert(`Delete "${exercise.name}"?`, "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExercise(database, exercise.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TextButton label="Save" onPress={exerciseForm.save} disabled={exerciseForm.isSaving} />
          ),
        }}
      />
      <ExerciseForm
        values={exerciseForm.values}
        errors={exerciseForm.errors}
        onChangeValues={exerciseForm.changeValues}
        footer={
          <Box gap="small" align="center">
            <TextButton
              label="Delete exercise"
              color="danger"
              onPress={confirmDelete}
              disabled={isInUse || exerciseForm.isSaving}
            />
            {isInUse ? (
              <Typography variant="caption" color="textSecondary" align="center">
                This exercise is used in a workout or a past session, so it can&apos;t be deleted.
              </Typography>
            ) : null}
          </Box>
        }
      />
    </>
  );
}

export default function EditExerciseScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const exerciseLookup = useExercise(Number(exerciseId));

  if (exerciseLookup.status === 'loading') {
    return null;
  }

  if (exerciseLookup.status === 'missing') {
    return (
      <EmptyState
        nuggie="workout"
        title="Exercise not found"
        message="This exercise may have been deleted."
        actionLabel="Back to library"
        onAction={router.back}
      />
    );
  }

  return <EditExercise exercise={exerciseLookup.exercise} usageCount={exerciseLookup.usageCount} />;
}
