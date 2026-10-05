import { useMemo, useReducer, useState, type ReactNode } from 'react';

import { WorkoutEditorContext } from '@/workouts/WorkoutEditorContext';
import {
  createKeyCounter,
  createWorkoutEditorReducer,
  initialWorkoutEditorState,
} from '@/workouts/workoutEditorReducer';

type WorkoutEditorProviderProperties = {
  children: ReactNode;
};

export function WorkoutEditorProvider({ children }: WorkoutEditorProviderProperties) {
  const [workoutEditorReducer] = useState(() => createWorkoutEditorReducer(createKeyCounter('editor')));
  const [state, dispatch] = useReducer(workoutEditorReducer, initialWorkoutEditorState);
  const workoutEditor = useMemo(() => ({ state, dispatch }), [state]);

  return <WorkoutEditorContext.Provider value={workoutEditor}>{children}</WorkoutEditorContext.Provider>;
}
