import { createContext, type Dispatch } from 'react';

import type { WorkoutEditorAction, WorkoutEditorState } from '@/workouts/workoutEditorReducer';

export type WorkoutEditor = {
  state: WorkoutEditorState;
  dispatch: Dispatch<WorkoutEditorAction>;
};

export const WorkoutEditorContext = createContext<WorkoutEditor | null>(null);
