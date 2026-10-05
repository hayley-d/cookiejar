import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';

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
  const [isLeavingPermitted, setIsLeavingPermitted] = useState(false);
  const pendingLeave = useRef<(() => void) | null>(null);

  const leaveWithoutPrompt = useCallback((leave: () => void) => {
    pendingLeave.current = leave;
    setIsLeavingPermitted(true);
  }, []);

  useEffect(() => {
    if (!isLeavingPermitted || pendingLeave.current === null) {
      return;
    }
    const leave = pendingLeave.current;
    pendingLeave.current = null;
    leave();
  }, [isLeavingPermitted]);

  const workoutEditor = useMemo(
    () => ({ state, dispatch, isLeavingPermitted, leaveWithoutPrompt }),
    [state, isLeavingPermitted, leaveWithoutPrompt],
  );

  return <WorkoutEditorContext.Provider value={workoutEditor}>{children}</WorkoutEditorContext.Provider>;
}
