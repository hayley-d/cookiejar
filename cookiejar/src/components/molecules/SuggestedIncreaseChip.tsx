import { Badge } from '@/components/atoms/Badge';
import { formatWeight } from '@/workouts/describeTargetSets';

type SuggestedIncreaseChipProperties = {
  increasedByKilograms: number;
};

export function SuggestedIncreaseChip({ increasedByKilograms }: SuggestedIncreaseChipProperties) {
  return <Badge label={`↑ ${formatWeight(increasedByKilograms)} kg · Nuggie`} />;
}
