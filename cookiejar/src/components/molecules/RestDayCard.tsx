import { NuggieActionCard } from '@/components/molecules/NuggieActionCard';
import { chooseNuggie } from '@/nuggies/chooseNuggie';

type RestDayCardProperties = {
  onPickWorkout: () => void;
};

export function RestDayCard({ onPickWorkout }: RestDayCardProperties) {
  return (
    <NuggieActionCard
      nuggieName={chooseNuggie({ kind: 'restDay' }, new Date())}
      title="Rest day — enjoy it!"
      actionLabel="Pick a workout anyway"
      onAction={onPickWorkout}
      actionVariant="secondary"
    />
  );
}
