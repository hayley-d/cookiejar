import { useState } from 'react';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseRow } from '@/components/molecules/ExerciseRow';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { formatShortDate } from '@/dates/formatShortDate';
import { filterExercisesByName } from '@/progress/filterExercisesByName';
import type { ExerciseWithHistory } from '@/types/ExerciseHistory';

type ExerciseProgressSectionProperties = {
  exercises: readonly ExerciseWithHistory[];
  onPressExercise: (exerciseId: number) => void;
};

export function ExerciseProgressSection({ exercises, onPressExercise }: ExerciseProgressSectionProperties) {
  const [searchText, setSearchText] = useState('');

  if (exercises.length === 0) {
    return null;
  }

  const visibleExercises = filterExercisesByName(exercises, searchText);

  return (
    <Box gap="small">
      <Typography variant="heading">Exercises</Typography>
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search exercises" />
      {visibleExercises.length === 0 ? (
        <EmptyState title="No matches" message="No exercise you have done matches that name." />
      ) : (
        visibleExercises.map((exercise) => (
          <ExerciseRow
            key={exercise.exerciseId}
            name={exercise.name}
            caption={`Last performed ${formatShortDate(toLocalDateString(new Date(exercise.lastPerformedAt)))}`}
            imageUrl={exercise.imageUrl}
            onPress={() => onPressExercise(exercise.exerciseId)}
          />
        ))
      )}
    </Box>
  );
}
