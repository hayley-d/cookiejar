import { NuggieActionCard } from '@/components/molecules/NuggieActionCard';

type HealthPermissionCardProperties = {
  onConnect: () => void;
  isConnecting?: boolean;
};

export function HealthPermissionCard({ onConnect, isConnecting = false }: HealthPermissionCardProperties) {
  return (
    <NuggieActionCard
      nuggieName="coach"
      title="Connect Apple Health"
      message={
        'I can show your steps, sleep and resting heart rate here. Garmin Connect shares them through Apple Health, ' +
        'and everything stays on your phone.'
      }
      actionLabel="Connect"
      onAction={onConnect}
      isActionDisabled={isConnecting}
    />
  );
}
