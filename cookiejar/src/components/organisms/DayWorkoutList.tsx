import { router } from 'expo-router';

import { Button } from '@/components/atoms/Button';
import { RestDay } from '@/components/molecules/RestDay';
import { ScheduledWorkoutCard } from '@/components/molecules/ScheduledWorkoutCard';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { ScheduledWorkoutsForDateLookup } from '@/plans/scheduledWeekCache';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';
import { startWorkout } from '@/workouts/startWorkout';

type DayWorkoutListProperties = {
  lookup: ScheduledWorkoutsForDateLookup;
  today: string;
};

function openWorkout(scheduledWorkout: ScheduledWorkout) {
  const workoutId = scheduledWorkout.workout.id;
  if (workoutId === null) {
    return;
  }
  router.push({
    pathname: '/workout/[workoutId]',
    params: {
      workoutId: String(workoutId),
      date: scheduledWorkout.date,
      ...(scheduledWorkout.planEntryId === null ? {} : { planEntryId: String(scheduledWorkout.planEntryId) }),
    },
  });
}

function startScheduledWorkout(scheduledWorkout: ScheduledWorkout) {
  const workoutId = scheduledWorkout.workout.id;
  if (workoutId === null) {
    return;
  }
  startWorkout({ workoutId, date: scheduledWorkout.date, planEntryId: scheduledWorkout.planEntryId });
}

export function DayWorkoutList({ lookup, today }: DayWorkoutListProperties) {
  if (lookup.status === 'loading') {
    return (
      <Box paddingHorizontal="medium">
        <Typography color="textSecondary">Loading workouts…</Typography>
      </Box>
    );
  }

  if (lookup.status === 'failed') {
    return (
      <Box paddingHorizontal="medium">
        <Typography color="danger">Could not load workouts for this week.</Typography>
      </Box>
    );
  }

  if (lookup.scheduledWorkouts.length === 0) {
    return (
      <Box paddingHorizontal="medium" gap="medium" align="flex-start">
        <RestDay />
        <Button label="Browse workouts" variant="secondary" onPress={() => router.navigate('/create')} />
      </Box>
    );
  }

  return (
    <Box paddingHorizontal="medium" gap="medium">
      {lookup.scheduledWorkouts.map((scheduledWorkout) => (
        <ScheduledWorkoutCard
          key={`${scheduledWorkout.planEntryId ?? 'unplanned'}-${scheduledWorkout.sessionId ?? 'none'}`}
          scheduledWorkout={scheduledWorkout}
          today={today}
          onPress={() => openWorkout(scheduledWorkout)}
          onStart={() => startScheduledWorkout(scheduledWorkout)}
        />
      ))}
    </Box>
  );
}
