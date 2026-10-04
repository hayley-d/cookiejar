import { router, Stack } from 'expo-router';
import { useMemo, useRef } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { AlphabetIndex } from '@/components/molecules/AlphabetIndex';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseRow } from '@/components/molecules/ExerciseRow';
import { Box } from '@/components/primitives/Box';
import { SectionedList, type SectionedListHandle } from '@/components/primitives/SectionedList';
import { Typography } from '@/components/primitives/Typography';
import {
  findNearestSectionTitle,
  groupExercisesAlphabetically,
  type AlphabeticalSection,
} from '@/exercises/groupExercisesAlphabetically';
import { useExercises } from '@/hooks/useExercises';
import type { Exercise } from '@/types/Exercise';

const scrollRetryDelayInMilliseconds = 50;

function openNewExercise() {
  router.push('/exercises/new');
}

function openExercise(exerciseId: number) {
  router.push({ pathname: '/exercises/[exerciseId]', params: { exerciseId: String(exerciseId) } });
}

export default function ExerciseLibraryScreen() {
  const exercises = useExercises();
  const sectionedListReference = useRef<SectionedListHandle<Exercise, AlphabeticalSection<Exercise>>>(null);
  const sections = useMemo(() => groupExercisesAlphabetically(exercises ?? []), [exercises]);
  const sectionTitles = useMemo(() => sections.map((section) => section.title), [sections]);

  const targetSectionIndex = useRef(0);

  const scrollToSection = (sectionIndex: number) => {
    targetSectionIndex.current = sectionIndex;
    sectionedListReference.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      viewPosition: 0,
      animated: false,
    });
  };

  const jumpToLetter = (letter: string) => {
    const nearestTitle = findNearestSectionTitle(letter, sectionTitles);
    if (nearestTitle !== undefined) {
      scrollToSection(sectionTitles.indexOf(nearestTitle));
    }
  };

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
        <Box flex={1} direction="row">
          <Box flex={1}>
            <SectionedList
              ref={sectionedListReference}
              sections={sections}
              keyExtractor={(exercise) => String(exercise.id)}
              renderSectionHeader={({ section }) => (
                <Box background="background" paddingVertical="extraSmall">
                  <Typography variant="heading">{section.title}</Typography>
                </Box>
              )}
              renderItem={({ item: exercise }) => (
                <ExerciseRow
                  name={exercise.name}
                  imageUrl={exercise.imageUrl}
                  onPress={() => openExercise(exercise.id)}
                />
              )}
              onScrollToIndexFailed={(failure) => {
                sectionedListReference.current
                  ?.getScrollResponder()
                  ?.scrollTo({ y: failure.averageItemLength * failure.index, animated: false });
                setTimeout(() => scrollToSection(targetSectionIndex.current), scrollRetryDelayInMilliseconds);
              }}
            />
          </Box>
          <Box justify="center">
            <AlphabetIndex availableLetters={sectionTitles} onSelectLetter={jumpToLetter} />
          </Box>
        </Box>
      )}
    </>
  );
}
