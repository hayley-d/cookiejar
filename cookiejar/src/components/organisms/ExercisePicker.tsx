import { useMemo, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { AlphabetIndex } from '@/components/molecules/AlphabetIndex';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseRow } from '@/components/molecules/ExerciseRow';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Box } from '@/components/primitives/Box';
import { SectionedList, type SectionedListHandle } from '@/components/primitives/SectionedList';
import { Typography } from '@/components/primitives/Typography';
import { filterExercises } from '@/exercises/filterExercises';
import {
  findNearestSectionTitle,
  groupExercisesAlphabetically,
  type AlphabeticalSection,
} from '@/exercises/groupExercisesAlphabetically';
import { useTheme } from '@/theme/useTheme';
import type { Exercise } from '@/types/Exercise';

export type ExercisePickerVariant = 'browse' | 'multiple' | 'single';

type ExercisePickerProperties = {
  variant: ExercisePickerVariant;
  exercises: Exercise[];
  searchText: string;
  onChangeSearchText: (searchText: string) => void;
  onPressExercise: (exerciseId: number) => void;
  selectedExerciseIds?: number[];
  excludedExerciseIds?: number[];
  onClose?: () => void;
  onCreateExercise?: () => void;
  onAddExercises?: () => void;
  onCreateSuperset?: () => void;
};

const scrollRetryDelayInMilliseconds = 50;
const minimumSupersetSize = 2;

export function ExercisePicker({
  variant,
  exercises,
  searchText,
  onChangeSearchText,
  onPressExercise,
  selectedExerciseIds = [],
  excludedExerciseIds = [],
  onClose,
  onCreateExercise,
  onAddExercises,
  onCreateSuperset,
}: ExercisePickerProperties) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const sectionedListReference = useRef<SectionedListHandle<Exercise, AlphabeticalSection<Exercise>>>(null);
  const targetSectionIndex = useRef(0);

  const sections = useMemo(
    () => groupExercisesAlphabetically(filterExercises(exercises, { searchText })),
    [exercises, searchText],
  );
  const sectionTitles = useMemo(() => sections.map((section) => section.title), [sections]);
  const isSearching = searchText.trim() !== '';

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

  const rowSelectionFor = (exerciseId: number) => {
    const isExcluded = excludedExerciseIds.includes(exerciseId);
    if (variant === 'browse') {
      return { isSelected: undefined, disabled: false };
    }
    if (variant === 'single') {
      return { isSelected: isExcluded ? true : undefined, disabled: isExcluded };
    }
    return { isSelected: isExcluded || selectedExerciseIds.includes(exerciseId), disabled: isExcluded };
  };

  return (
    <Box flex={1} background="background">
      {onClose ? (
        <Box
          direction="row"
          align="center"
          paddingHorizontal="small"
          style={{ paddingTop: safeAreaInsets.top }}
        >
          <Box flex={1} align="flex-start">
            <IconButton icon="xmark" accessibilityLabel="Close" onPress={onClose} />
          </Box>
          <Typography variant="heading">Exercises</Typography>
          <Box flex={1} align="flex-end">
            {onCreateExercise ? (
              <IconButton icon="plus" accessibilityLabel="New exercise" color="accent" onPress={onCreateExercise} />
            ) : null}
          </Box>
        </Box>
      ) : null}
      <Box paddingHorizontal="medium" paddingVertical="small">
        <SearchBar value={searchText} onChangeText={onChangeSearchText} placeholder="Search exercises" />
      </Box>
      <Box flex={1} direction="row">
        <Box flex={1}>
          <SectionedList
            ref={sectionedListReference}
            sections={sections}
            keyExtractor={(exercise) => String(exercise.id)}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderSectionHeader={({ section }) => (
              <Box background="background" paddingVertical="extraSmall">
                <Typography variant="heading">{section.title}</Typography>
              </Box>
            )}
            renderItem={({ item: exercise }) => (
              <ExerciseRow
                name={exercise.name}
                imageUrl={exercise.imageUrl}
                onPress={() => onPressExercise(exercise.id)}
                {...rowSelectionFor(exercise.id)}
              />
            )}
            ListEmptyComponent={
              isSearching ? (
                <EmptyState title="No matches" message={`No exercise names contain "${searchText.trim()}".`} />
              ) : (
                <EmptyState nuggie="workout" title="Exercise library" message="No exercises yet — add your first one!" />
              )
            }
            onScrollToIndexFailed={(failure) => {
              sectionedListReference.current
                ?.getScrollResponder()
                ?.scrollTo({ y: failure.averageItemLength * failure.index, animated: false });
              setTimeout(() => scrollToSection(targetSectionIndex.current), scrollRetryDelayInMilliseconds);
            }}
          />
        </Box>
        {sections.length === 0 ? null : (
          <Box justify="center">
            <AlphabetIndex availableLetters={sectionTitles} onSelectLetter={jumpToLetter} />
          </Box>
        )}
      </Box>
      {variant === 'multiple' ? (
        <Box
          direction="row"
          gap="small"
          paddingHorizontal="medium"
          background="background"
          style={{
            paddingTop: theme.spacing.small,
            paddingBottom: safeAreaInsets.bottom + theme.spacing.small,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <Box flex={1}>
            <Button
              label="Create superset"
              variant="secondary"
              disabled={selectedExerciseIds.length < minimumSupersetSize}
              onPress={() => onCreateSuperset?.()}
            />
          </Box>
          <Box flex={1}>
            <Button
              label={`Add exercises (${selectedExerciseIds.length})`}
              disabled={selectedExerciseIds.length === 0}
              onPress={() => onAddExercises?.()}
            />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
