import { WorkoutHistoryList } from '@/components/organisms/WorkoutHistoryList';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function WorkoutsScreen() {
  const workouts = useWorkouts();

  return <WorkoutHistoryList workouts={workouts} />;
}
