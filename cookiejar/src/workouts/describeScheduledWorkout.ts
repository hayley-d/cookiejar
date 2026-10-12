import { formatTimeOfDay } from '@/plans/timeOfDay';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';
import type { WorkoutKind } from '@/types/WorkoutKind';
import { estimateWorkoutMinutes } from '@/workouts/estimateWorkoutMinutes';
import { workoutTypeLabel } from '@/workouts/workoutTypeLabel';

const kindFallbackLabels: Record<WorkoutKind, string> = {
  individual: 'Workout',
  class: 'Class',
  activity: 'Activity',
  swim: 'Swim',
};

export function describeScheduledWorkoutKind(scheduledWorkout: ScheduledWorkout): string {
  const { workout } = scheduledWorkout;
  const kindLabel = workoutTypeLabel(workout) ?? kindFallbackLabels[workout.kind];
  if (scheduledWorkout.timeOfDay === null) {
    return kindLabel;
  }
  return `${formatTimeOfDay(scheduledWorkout.timeOfDay)} · ${kindLabel}`;
}

export function describeScheduledWorkoutSummary(scheduledWorkout: ScheduledWorkout): string | null {
  const { kind, durationMinutes, exerciseCount, targetSetCount, targetRestSeconds } = scheduledWorkout.workout;
  if (kind === 'activity' || kind === 'swim') {
    return null;
  }
  if (kind === 'class') {
    return durationMinutes === null ? null : `${durationMinutes} min`;
  }
  const exerciseLabel = `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  const estimatedMinutes = estimateWorkoutMinutes({ targetSetCount, targetRestSeconds });
  return estimatedMinutes === 0 ? exerciseLabel : `${exerciseLabel} · ~${estimatedMinutes} min`;
}
