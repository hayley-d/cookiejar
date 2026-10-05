import { useContext } from 'react';

import { WorkoutEditorContext } from '@/workouts/WorkoutEditorContext';

export function useWorkoutEditor() {
  const workoutEditor = useContext(WorkoutEditorContext);
  if (workoutEditor === null) {
    throw new Error('useWorkoutEditor must be used inside WorkoutEditorProvider');
  }
  return workoutEditor;
}
