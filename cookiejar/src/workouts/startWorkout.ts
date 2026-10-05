import { Alert } from 'react-native';

export type StartWorkoutRequest = {
  workoutId: number;
  date: string;
  planEntryId: number | null;
};

export function startWorkout(request: StartWorkoutRequest): void {
  void request;
  Alert.alert('Coming soon', 'Workout sessions arrive in Phase 05.');
}
