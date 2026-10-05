import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ExerciseEditorCard } from '@/components/organisms/ExerciseEditorCard';
import { WorkoutEditorFooter } from '@/components/organisms/WorkoutEditorFooter';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { getExercise } from '@/database/repositories/exerciseRepository';
import { useSaveWorkout } from '@/hooks/useSaveWorkout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import {
  beginExercisePick,
  createExercisePickRequestIdentifier,
  useExercisePickResult,
  type ExercisePickResult,
} from '@/stores/exercisePickerStore';
import type { Exercise } from '@/types/Exercise';
import { workoutNameError } from '@/workouts/workoutNameError';

type WorkoutEditorParameters = {
  pickOnOpen?: string;
};

function startExercisePick() {
  const requestIdentifier = createExercisePickRequestIdentifier();
  beginExercisePick(requestIdentifier);
  return requestIdentifier;
}

function openExercisePicker(requestIdentifier: string, excludedExerciseIds: number[]) {
  router.push({
    pathname: '/exercises/picker',
    params: { requestIdentifier, mode: 'multiple', excludeExerciseIds: excludedExerciseIds.join(',') },
  });
}

function isExercise(exercise: Exercise | null): exercise is Exercise {
  return exercise !== null;
}

export default function WorkoutEditorScreen() {
  const database = useSQLiteContext();
  const { pickOnOpen } = useLocalSearchParams<WorkoutEditorParameters>();
  const { state, dispatch } = useWorkoutEditor();
  const { isSaving, save: saveEditorState } = useSaveWorkout();
  useUnsavedChangesGuard(state.hasUnsavedChanges);
  const [openingRequestIdentifier] = useState(() =>
    pickOnOpen === 'true' && state.items.length === 0 ? startExercisePick() : null,
  );
  const [pickRequestIdentifier, setPickRequestIdentifier] = useState(openingRequestIdentifier);
  const pickResult = useExercisePickResult(pickRequestIdentifier);
  const [lastPickResult, setLastPickResult] = useState<ExercisePickResult | null>(null);
  const [pickedExerciseIds, setPickedExerciseIds] = useState<number[]>([]);
  const hasOpenedPickerOnOpen = useRef(false);

  if (pickResult !== null && pickResult !== lastPickResult) {
    setLastPickResult(pickResult);
    setPickedExerciseIds((currentExerciseIds) => [...currentExerciseIds, ...pickResult.exerciseIds]);
  }

  useEffect(() => {
    if (openingRequestIdentifier === null || hasOpenedPickerOnOpen.current) {
      return;
    }
    hasOpenedPickerOnOpen.current = true;
    openExercisePicker(openingRequestIdentifier, []);
  }, [openingRequestIdentifier]);

  useEffect(() => {
    if (pickedExerciseIds.length === 0) {
      return;
    }
    let isActive = true;
    Promise.all(pickedExerciseIds.map((exerciseId) => getExercise(database, exerciseId))).then((exercises) => {
      if (isActive) {
        dispatch({ type: 'exercisesAdded', exercises: exercises.filter(isExercise) });
        setPickedExerciseIds([]);
      }
    });
    return () => {
      isActive = false;
    };
  }, [database, dispatch, pickedExerciseIds]);

  const addExercises = () => {
    const requestIdentifier = startExercisePick();
    setPickRequestIdentifier(requestIdentifier);
    openExercisePicker(
      requestIdentifier,
      state.items.map((item) => item.exercise.id),
    );
  };

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
          pickedExerciseIds.length > 0 ? null : (
            <EmptyState
              nuggie="workout"
              title="No exercises yet"
              message="Pick the exercises for this workout, then set the target for each set."
              actionLabel="Add exercises"
              onAction={addExercises}
            />
          )
        ) : (
          <ScrollBox automaticallyAdjustKeyboardInsets>
            {state.items.map((item) => (
              <ExerciseEditorCard
                key={item.key}
                item={item}
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
              />
            ))}
          </ScrollBox>
        )}
        <WorkoutEditorFooter canSave={canSave} onAddExercises={addExercises} onSave={save} />
      </Box>
    </>
  );
}
