import { Stack } from 'expo-router';

import { WorkoutNameField } from '@/components/molecules/WorkoutNameField';
import { FormField } from '@/components/molecules/FormField';
import { ImageUrlField } from '@/components/molecules/ImageUrlField';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { ReorderableScroll } from '@/components/organisms/ReorderableScroll';
import { SwimEditorFooter } from '@/components/organisms/SwimEditorFooter';
import { SwimSectionCard } from '@/components/organisms/SwimSectionCard';
import { Box } from '@/components/primitives/Box';
import { TextField } from '@/components/primitives/TextField';
import { Button } from '@/components/atoms/Button';
import { useSaveWorkout } from '@/hooks/useSaveWorkout';
import { useSwimStrokes } from '@/hooks/useSwimStrokes';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { imageUrlError } from '@/images/imageUrls';
import { describeSwimSet } from '@/swimming/describeSwimSet';
import { formatSwimDistance, swimWorkoutDistance } from '@/swimming/swimDistance';
import type { EditorSwimSection, SwimEditorAction } from '@/swimming/swimEditorReducer';
import { isSwimPoolLength, swimPoolLengths } from '@/types/SwimPoolLength';
import { workoutNameError } from '@/workouts/workoutNameError';

const poolLengthSegments = swimPoolLengths.map((poolLength) => ({
  value: String(poolLength),
  label: `${poolLength} m`,
}));

const descriptionMinimumHeight = 96;

function describeSectionForReorder(section: EditorSwimSection) {
  const sectionName = section.name.trim();
  return sectionName.length === 0 ? 'Untitled section' : sectionName;
}

function blockReorderRows(section: EditorSwimSection) {
  return section.blocks.map((block) => ({
    key: block.key,
    label: block.sets.map((set) => describeSwimSet(set)).join(' + '),
  }));
}

export default function SwimEditorScreen() {
  const { state, dispatch } = useWorkoutEditor();
  const { isSaving, save: saveEditorState } = useSaveWorkout();
  useUnsavedChangesGuard(state.hasUnsavedChanges);
  const strokes = useSwimStrokes();
  const { swimDetails } = state;

  if (swimDetails === null) {
    return null;
  }

  const changeSwim = (action: SwimEditorAction) => dispatch({ type: 'swimChanged', action });
  const defaultStroke = strokes.find((stroke) => stroke.name === 'Freestyle') ?? strokes[0];
  const isEditingSavedWorkout = state.workoutId !== null;
  const nameError = workoutNameError(state.name);
  const imageUrlProblem = imageUrlError(swimDetails.imageUrl);
  const totalDistanceMeters = swimWorkoutDistance(swimDetails.sections);
  const canSave = totalDistanceMeters > 0 && !isSaving && nameError === null && imageUrlProblem === null;

  const save = async () => {
    if (!canSave) {
      return;
    }
    await saveEditorState(state);
  };

  return (
    <>
          <Stack.Screen options={{ title: state.name.trim() }} />
          <Box flex={1}>
            <ReorderableScroll gap="large">
              {(renderDragHandle) => (
                <>
              {isEditingSavedWorkout ? (
                <WorkoutNameField
                  name={state.name}
                  error={nameError}
                  onChangeName={(name) => dispatch({ type: 'renamed', name })}
                />
              ) : null}
              <FormField label="Pool length">
                <SegmentedControl
                  segments={poolLengthSegments}
                  selectedValue={String(swimDetails.poolLengthMeters)}
                  onSelect={(poolLength) => {
                    const poolLengthMeters = Number(poolLength);
                    if (isSwimPoolLength(poolLengthMeters)) {
                      changeSwim({ type: 'detailsChanged', changes: { poolLengthMeters } });
                    }
                  }}
                />
              </FormField>
              <FormField label="Description">
                <TextField
                  value={swimDetails.description}
                  onChangeText={(description) => changeSwim({ type: 'detailsChanged', changes: { description } })}
                  placeholder="Optional"
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Description"
                  style={{ minHeight: descriptionMinimumHeight }}
                />
              </FormField>
              <ImageUrlField
                imageUrl={swimDetails.imageUrl}
                error={imageUrlProblem ?? undefined}
                onChangeImageUrl={(imageUrl) => changeSwim({ type: 'detailsChanged', changes: { imageUrl } })}
              />
              {swimDetails.sections.map((section, sectionIndex) => (
                <SwimSectionCard
                  key={section.key}
                  section={section}
                  strokes={strokes}
                  canAddSet={defaultStroke !== undefined}
                  dragHandle={renderDragHandle(`Reorder ${describeSectionForReorder(section)}`, {
                    rows: swimDetails.sections.map((candidate) => ({
                      key: candidate.key,
                      label: describeSectionForReorder(candidate),
                    })),
                    fromIndex: sectionIndex,
                    onCommit: (sectionKeys) => changeSwim({ type: 'sectionsReordered', sectionKeys }),
                  })}
                  renderBlockDragHandle={(blockIndex) => {
                    const rows = blockReorderRows(section);
                    return renderDragHandle(`Reorder ${rows[blockIndex]?.label ?? 'set'}`, {
                      rows,
                      fromIndex: blockIndex,
                      onCommit: (blockKeys) =>
                        changeSwim({ type: 'blocksReordered', sectionKey: section.key, blockKeys }),
                    });
                  }}
                  onChangeName={(name) => changeSwim({ type: 'sectionRenamed', sectionKey: section.key, name })}
                  onRemove={() => changeSwim({ type: 'sectionRemoved', sectionKey: section.key })}
                  onAddSet={() => {
                    if (defaultStroke !== undefined) {
                      changeSwim({ type: 'setAdded', sectionKey: section.key, stroke: defaultStroke });
                    }
                  }}
                  onAddSetToBlock={(blockKey) => changeSwim({ type: 'setAddedToBlock', blockKey })}
                  onChangeRounds={(blockKey, rounds) => changeSwim({ type: 'blockRoundsChanged', blockKey, rounds })}
                  onChangeBlockRest={(blockKey, restAfterSeconds) =>
                    changeSwim({ type: 'blockRestChanged', blockKey, restAfterSeconds })
                  }
                  onChangeSet={(setKey, changes) => changeSwim({ type: 'setChanged', setKey, changes })}
                  onRemoveSet={(setKey) => changeSwim({ type: 'setRemoved', setKey })}
                />
              ))}
              <Button label="Add section" variant="secondary" onPress={() => changeSwim({ type: 'sectionAdded' })} />
            </>
          )}
        </ReorderableScroll>
        <SwimEditorFooter
          totalText={`Total ${formatSwimDistance(totalDistanceMeters)}`}
          canSave={canSave}
          onSave={save}
        />
      </Box>
    </>
  );
}
