import { createContext, type Dispatch } from 'react';

import type { WorkoutEditorAction, WorkoutEditorState } from '@/workouts/workoutEditorReducer';

export type WorkoutEditor = {
  state: WorkoutEditorState;
  dispatch: Dispatch<WorkoutEditorAction>;
  isLeavingPermitted: boolean;
  leaveWithoutPrompt: (leave: () => void) => void;
  isReordering: boolean;
  setIsReordering: (isReordering: boolean) => void;
};

export const WorkoutEditorContext = createContext<WorkoutEditor | null>(null);
