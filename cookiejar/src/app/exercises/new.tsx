import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { TextButton } from '@/components/atoms/TextButton';
import { ExerciseForm } from '@/components/organisms/ExerciseForm';
import { createExercise, type NewExercise } from '@/database/repositories/exerciseRepository';
import type { ExerciseFormValues } from '@/exercises/validateExerciseForm';
import { useExerciseForm } from '@/hooks/useExerciseForm';
import { completeExercisePick } from '@/stores/exercisePickerStore';

const initialValues: ExerciseFormValues = {
  name: '',
  bodyPart: null,
  defaultTrackingType: 'repetitions_and_weight',
  imageUrl: '',
  notes: '',
};

export default function NewExerciseScreen() {
  const database = useSQLiteContext();
  const { requestIdentifier } = useLocalSearchParams<{ requestIdentifier?: string }>();

  async function saveExercise(newExercise: NewExercise) {
    const exerciseId = await createExercise(database, newExercise);
    if (requestIdentifier) {
      completeExercisePick(requestIdentifier, { exerciseIds: [exerciseId], asSuperset: false });
    }
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
