import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { ExercisePicker } from '@/components/organisms/ExercisePicker';
import { toggleExerciseSelection } from '@/exercises/toggleExerciseSelection';
import { useExercises } from '@/hooks/useExercises';
import { useRecentlyUsedExercises } from '@/hooks/useRecentlyUsedExercises';
import { completeExercisePick } from '@/stores/exercisePickerStore';

type ExercisePickerParameters = {
  requestIdentifier?: string;
  mode?: 'multiple' | 'single';
  excludeExerciseIds?: string;
};

function parseExerciseIds(commaSeparatedExerciseIds: string | undefined) {
  if (!commaSeparatedExerciseIds) {
    return [];
  }
  return commaSeparatedExerciseIds
    .split(',')
    .map((exerciseId) => Number(exerciseId.trim()))
    .filter((exerciseId) => Number.isInteger(exerciseId));
}

export default function ExercisePickerScreen() {
  const { requestIdentifier, mode = 'multiple', excludeExerciseIds } = useLocalSearchParams<ExercisePickerParameters>();
  const exercises = useExercises();
  const recentExercises = useRecentlyUsedExercises();
  const excludedExerciseIds = useMemo(() => parseExerciseIds(excludeExerciseIds), [excludeExerciseIds]);
  const [searchText, setSearchText] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);

  const returnSelection = (exerciseIds: number[], asSuperset: boolean) => {
    if (requestIdentifier) {
      completeExercisePick(requestIdentifier, { exerciseIds, asSuperset });
    }
    router.back();
  };

  const pressExercise = (exerciseId: number) => {
    if (excludedExerciseIds.includes(exerciseId)) {
      return;
    }
    if (mode === 'single') {
      returnSelection([exerciseId], false);
      return;
    }
    setSelectedExerciseIds((currentSelection) => toggleExerciseSelection(currentSelection, exerciseId));
  };

  if (exercises === null) {
    return null;
  }

  return (
    <ExercisePicker
      variant={mode}
      exercises={exercises}
      recentExercises={recentExercises}
      searchText={searchText}
      onChangeSearchText={setSearchText}
      onPressExercise={pressExercise}
      selectedExerciseIds={selectedExerciseIds}
      excludedExerciseIds={excludedExerciseIds}
      onClose={() => router.back()}
      onAddExercises={() => returnSelection(selectedExerciseIds, false)}
      onCreateSuperset={() => returnSelection(selectedExerciseIds, true)}
    />
  );
}
