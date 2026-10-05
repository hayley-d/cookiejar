import { formatTimeOfDay } from '@/plans/timeOfDay';
import { classTypeLabels } from '@/types/ClassType';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';
import { estimateWorkoutMinutes } from '@/workouts/estimateWorkoutMinutes';

export function describeScheduledWorkoutKind(scheduledWorkout: ScheduledWorkout): string {
  const { kind, classType } = scheduledWorkout.workout;
  const kindLabel = kind === 'class' ? (classType === null ? 'Class' : classTypeLabels[classType]) : 'Workout';
  if (scheduledWorkout.timeOfDay === null) {
    return kindLabel;
  }
  return `${formatTimeOfDay(scheduledWorkout.timeOfDay)} · ${kindLabel}`;
}

export function describeScheduledWorkoutSummary(scheduledWorkout: ScheduledWorkout): string | null {
  const { kind, durationMinutes, exerciseCount, targetSetCount, targetRestSeconds } = scheduledWorkout.workout;
  if (kind === 'class') {
    return durationMinutes === null ? null : `${durationMinutes} min`;
  }
  const exerciseLabel = `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  const estimatedMinutes = estimateWorkoutMinutes({ targetSetCount, targetRestSeconds });
  return estimatedMinutes === 0 ? exerciseLabel : `${exerciseLabel} · ~${estimatedMinutes} min`;
}
