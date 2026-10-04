import { EmptyState } from '@/components/molecules/EmptyState';
import { WorkoutHistoryItem } from '@/components/molecules/WorkoutHistoryItem';
import { List } from '@/components/primitives/List';
import type { Workout } from '@/types/Workout';

type WorkoutHistoryListProperties = {
  workouts: Workout[];
};

export function WorkoutHistoryList({ workouts }: WorkoutHistoryListProperties) {
  return (
    <List
      data={workouts}
      keyExtractor={(workout) => String(workout.id)}
      renderItem={({ item: workout }) => <WorkoutHistoryItem workout={workout} />}
      ListEmptyComponent={
        <EmptyState title="No workouts yet" message="Workouts you log will show up here." />
      }
    />
  );
}
