import { useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { IconButton } from '@/components/atoms/IconButton';
import { AlphabetIndex } from '@/components/molecules/AlphabetIndex';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseRow } from '@/components/molecules/ExerciseRow';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SegmentedControl, type Segment } from '@/components/molecules/SegmentedControl';
import { Box } from '@/components/primitives/Box';
import { List } from '@/components/primitives/List';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { SectionedList, type SectionedListHandle } from '@/components/primitives/SectionedList';
import { Typography } from '@/components/primitives/Typography';
import { filterExercises } from '@/exercises/filterExercises';
import {
  findNearestSectionTitle,
  groupExercisesAlphabetically,
  type AlphabeticalSection,
} from '@/exercises/groupExercisesAlphabetically';
import { useTheme } from '@/theme/useTheme';
import { bodyPartLabels, bodyParts, type BodyPart } from '@/types/BodyPart';
import type { Exercise } from '@/types/Exercise';

export type ExercisePickerVariant = 'browse' | 'multiple' | 'single';

type ExercisePickerProperties = {
  variant: ExercisePickerVariant;
  exercises: Exercise[];
  recentExercises: Exercise[] | null;
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

type ExercisePickerTab = 'alphabetical' | 'bodyPart' | 'recent';

const tabSegments: Segment<ExercisePickerTab>[] = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'bodyPart', label: 'Body part' },
  { value: 'recent', label: 'Recent' },
];

const scrollRetryDelayInMilliseconds = 50;
const minimumSupersetSize = 2;

export function ExercisePicker({
  variant,
  exercises,
  recentExercises,
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
  const [activeTab, setActiveTab] = useState<ExercisePickerTab>('alphabetical');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);

  const activeBodyPart = activeTab === 'bodyPart' ? selectedBodyPart : null;
  const sections = useMemo(
    () => groupExercisesAlphabetically(filterExercises(exercises, { searchText, bodyPart: activeBodyPart })),
    [exercises, searchText, activeBodyPart],
  );
  const filteredRecentExercises = useMemo(
    () => (recentExercises === null ? null : filterExercises(recentExercises, { searchText, bodyPart: null })),
    [recentExercises, searchText],
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

  const renderExerciseRow = ({ item: exercise }: { item: Exercise }) => (
    <ExerciseRow
      name={exercise.name}
      imageUrl={exercise.imageUrl}
      onPress={() => onPressExercise(exercise.id)}
      {...rowSelectionFor(exercise.id)}
    />
  );

  const emptyState = isSearching ? (
    <EmptyState title="No matches" message={`No exercise names contain "${searchText.trim()}".`} />
  ) : activeBodyPart !== null ? (
    <EmptyState
      title={`No ${bodyPartLabels[activeBodyPart]} exercises`}
      message="Exercises you give this body part show up here."
    />
  ) : (
    <EmptyState nuggie="workout" title="Exercise library" message="No exercises yet — add your first one!" />
  );

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
      <SegmentedControl segments={tabSegments} selectedValue={activeTab} onSelect={setActiveTab} />
      {activeTab === 'bodyPart' ? (
        <ScrollBox
          horizontal
          showsHorizontalScrollIndicator={false}
          gap="small"
          style={{ flexGrow: 0 }}
        >
          <Chip label="All" isSelected={selectedBodyPart === null} onPress={() => setSelectedBodyPart(null)} />
          {bodyParts.map((bodyPart) => (
            <Chip
              key={bodyPart}
              label={bodyPartLabels[bodyPart]}
              isSelected={selectedBodyPart === bodyPart}
              onPress={() => setSelectedBodyPart(bodyPart)}
            />
          ))}
        </ScrollBox>
      ) : null}
      {activeTab === 'recent' ? (
        <Box flex={1}>
          {filteredRecentExercises === null ? null : (
            <List
              data={filteredRecentExercises}
              keyExtractor={(exercise) => String(exercise.id)}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              renderItem={renderExerciseRow}
              ListEmptyComponent={emptyState}
            />
          )}
        </Box>
      ) : (
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
              renderItem={renderExerciseRow}
              ListEmptyComponent={emptyState}
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
      )}
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
