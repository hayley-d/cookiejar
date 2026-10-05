import { router, Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseEditorCard } from '@/components/organisms/ExerciseEditorCard';
import { WorkoutEditorFooter } from '@/components/organisms/WorkoutEditorFooter';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { useExercisePicks } from '@/hooks/useExercisePicks';
import { useSaveWorkout } from '@/hooks/useSaveWorkout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { toSupersetCardPositions } from '@/workouts/supersetCardPositions';
import { workoutNameError } from '@/workouts/workoutNameError';

type WorkoutEditorParameters = { pickOnOpen?: string };

export default function WorkoutEditorScreen() {
  const { pickOnOpen } = useLocalSearchParams<WorkoutEditorParameters>();
  const { state, dispatch } = useWorkoutEditor();
  const { isSaving, save: saveEditorState } = useSaveWorkout();
  useUnsavedChangesGuard(state.hasUnsavedChanges);
  const { isLoadingPick, addExercises, replaceExercise } = useExercisePicks({
    shouldPickOnOpen: pickOnOpen === 'true' && state.items.length === 0,
    dispatch,
  });

  const exerciseIdsExcluding = (itemKey?: string) =>
    state.items.filter((item) => item.key !== itemKey).map((item) => item.exercise.id);

  const supersetPositions = toSupersetCardPositions(state.items);
  const canSave = state.items.length > 0 && !isSaving;

  const save = async () => {
    if (!canSave || workoutNameError(state.name) !== null) {
      return;
    }
    await saveEditorState(state);
  };

  return (
    <>
      <Stack.Screen options={{ title: state.name.trim() }} />
      <Box flex={1}>
        {state.items.length === 0 ? (
          isLoadingPick ? null : (
            <EmptyState
              nuggie="workout"
              title="No exercises yet"
              message="Pick the exercises for this workout, then set the target for each set."
              actionLabel="Add exercises"
              onAction={() => addExercises(exerciseIdsExcluding())}
            />
          )
        ) : (
          <ScrollBox automaticallyAdjustKeyboardInsets>
            {state.items.map((item, itemIndex) => (
              <ExerciseEditorCard
                key={item.key}
                item={item}
                supersetPosition={supersetPositions[itemIndex]}
                onChangeTrackingType={(trackingType) =>
                  dispatch({ type: 'trackingTypeChanged', itemKey: item.key, trackingType })
                }
                onChangeTargetSet={(targetSetKey, changes) =>
                  dispatch({ type: 'targetSetChanged', itemKey: item.key, targetSetKey, changes })
                }
                onAddTargetSet={() => dispatch({ type: 'targetSetAdded', itemKey: item.key })}
                onRemoveTargetSet={(targetSetKey) =>
                  dispatch({ type: 'targetSetRemoved', itemKey: item.key, targetSetKey })
                }
                onChangeRest={(restSeconds) => dispatch({ type: 'restChanged', itemKey: item.key, restSeconds })}
                onReplace={() => replaceExercise(item.key, exerciseIdsExcluding(item.key))}
                onRemove={() => dispatch({ type: 'itemRemoved', itemKey: item.key })}
                onCreateSuperset={() => dispatch({ type: 'supersetCreated', itemKey: item.key })}
                onRemoveSuperset={() => dispatch({ type: 'supersetRemoved', itemKey: item.key })}
                onShowSupersetInfo={() => router.push('/workouts/superset-info')}
              />
            ))}
          </ScrollBox>
        )}
        <WorkoutEditorFooter
          canSave={canSave}
          onAddExercises={() => addExercises(exerciseIdsExcluding())}
          onSave={save}
        />
      </Box>
    </>
  );
}
