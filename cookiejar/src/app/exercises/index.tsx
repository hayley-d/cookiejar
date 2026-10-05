import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { Chip } from '@/components/atoms/Chip';
import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExercisePicker } from '@/components/organisms/ExercisePicker';
import { Box } from '@/components/primitives/Box';
import { filterExercises } from '@/exercises/filterExercises';
import { parseBodyPartParameter } from '@/exercises/parseBodyPartParameter';
import { useExercises } from '@/hooks/useExercises';
import { useRecentlyUsedExercises } from '@/hooks/useRecentlyUsedExercises';
import { bodyPartLabels } from '@/types/BodyPart';

function openNewExercise() {
  router.push('/exercises/new');
}

function clearBodyPartFilter() {
  router.setParams({ bodyPart: undefined });
}

function openExercise(exerciseId: number) {
  router.push({
    pathname: '/exercises/[exerciseId]',
    params: { exerciseId: String(exerciseId) },
  });
}

export default function ExerciseLibraryScreen() {
  const exercises = useExercises();
  const recentExercises = useRecentlyUsedExercises();
  const [searchText, setSearchText] = useState('');
  const { bodyPart: bodyPartParameter } = useLocalSearchParams<{
    bodyPart?: string;
  }>();
  const bodyPart = parseBodyPartParameter(bodyPartParameter);
  const visibleExercises = useMemo(
    () => (exercises === null ? null : filterExercises(exercises, { searchText: '', bodyPart })),
    [exercises, bodyPart],
  );
  const visibleRecentExercises = useMemo(
    () => (recentExercises === null ? null : filterExercises(recentExercises, { searchText: '', bodyPart })),
    [recentExercises, bodyPart],
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <TextButton label="Add" accessibilityLabel="Add exercise" onPress={openNewExercise} />,
        }}
      />
      {bodyPart === null ? null : (
        <Box direction="row" paddingHorizontal="medium" paddingVertical="small" background="background">
          <Chip label={`${bodyPartLabels[bodyPart]} ✕`} isSelected onPress={clearBodyPartFilter} />
        </Box>
      )}
      {exercises === null || visibleExercises === null ? null : exercises.length === 0 ? (
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
          exercises={visibleExercises}
          recentExercises={visibleRecentExercises}
          searchText={searchText}
          onChangeSearchText={setSearchText}
          onPressExercise={openExercise}
        />
      )}
    </>
  );
}
