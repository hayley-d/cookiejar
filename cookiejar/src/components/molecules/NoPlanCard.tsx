import { NuggieActionCard } from '@/components/molecules/NuggieActionCard';
import { chooseNuggie } from '@/nuggies/chooseNuggie';

type NoPlanCardProperties = {
  onCreatePlan: () => void;
};

export function NoPlanCard({ onCreatePlan }: NoPlanCardProperties) {
  return (
    <NuggieActionCard
      nuggieName={chooseNuggie({ kind: 'coach' }, new Date())}
      title="Let's make a plan!"
      actionLabel="Create plan"
      onAction={onCreatePlan}
    />
  );
}
