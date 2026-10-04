import { router, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { TextButton } from '@/components/atoms/TextButton';
import { ExerciseForm } from '@/components/organisms/ExerciseForm';
import { createExercise, type NewExercise } from '@/database/repositories/exerciseRepository';
import type { ExerciseFormValues } from '@/exercises/validateExerciseForm';
import { useExerciseForm } from '@/hooks/useExerciseForm';

const initialValues: ExerciseFormValues = {
  name: '',
  bodyPart: null,
  defaultTrackingType: 'repetitions_and_weight',
  imageUrl: '',
};

export default function NewExerciseScreen() {
  const database = useSQLiteContext();

  async function saveExercise(newExercise: NewExercise) {
    await createExercise(database, newExercise);
    router.back();
  }

  const exerciseForm = useExerciseForm({ initialValues, saveExercise });

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
      />
    </>
  );
}
