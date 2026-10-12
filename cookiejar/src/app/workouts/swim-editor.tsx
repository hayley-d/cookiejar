import { router, Stack } from 'expo-router';

import { WorkoutNameField } from '@/components/molecules/WorkoutNameField';
import { FormField } from '@/components/molecules/FormField';
import { ImageUrlField } from '@/components/molecules/ImageUrlField';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { SwimEditorFooter } from '@/components/organisms/SwimEditorFooter';
import { SwimSectionCard } from '@/components/organisms/SwimSectionCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { Button } from '@/components/atoms/Button';
import { useSaveWorkout } from '@/hooks/useSaveWorkout';
import { useSwimStrokes } from '@/hooks/useSwimStrokes';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { imageUrlError } from '@/images/imageUrls';
import { formatSwimDistance, swimWorkoutDistance } from '@/swimming/swimDistance';
import type { SwimEditorAction } from '@/swimming/swimEditorReducer';
import { isSwimPoolLength, swimPoolLengths } from '@/types/SwimPoolLength';
import { workoutNameError } from '@/workouts/workoutNameError';

const poolLengthSegments = swimPoolLengths.map((poolLength) => ({
  value: String(poolLength),
  label: `${poolLength} m`,
}));

const descriptionMinimumHeight = 96;

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
        <ScrollBox gap="large" automaticallyAdjustKeyboardInsets>
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
              canMoveUp={sectionIndex > 0}
              canMoveDown={sectionIndex < swimDetails.sections.length - 1}
              canAddSet={defaultStroke !== undefined}
              onChangeName={(name) => changeSwim({ type: 'sectionRenamed', sectionKey: section.key, name })}
              onMove={(offset) => changeSwim({ type: 'sectionMoved', sectionKey: section.key, offset })}
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
              onPressSet={(setKey) => router.push({ pathname: '/workouts/swim-set', params: { setKey } })}
            />
          ))}
          <Button label="Add section" variant="secondary" onPress={() => changeSwim({ type: 'sectionAdded' })} />
        </ScrollBox>
        <SwimEditorFooter
          totalText={`Total ${formatSwimDistance(totalDistanceMeters)}`}
          canSave={canSave}
          onSave={save}
        />
      </Box>
    </>
  );
}
