import { router, Stack } from 'expo-router';
import { Alert } from 'react-native';

import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { MeasurementRow } from '@/components/molecules/MeasurementRow';
import { List } from '@/components/primitives/List';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';

function openNewMeasurement() {
  router.push('/profile/measurements/new');
}

export default function MeasurementsScreen() {
  const { measurements, hasLoadFailed, removeMeasurement } = useBodyMeasurements();

  async function deleteMeasurement(bodyMeasurementId: number) {
    try {
      await removeMeasurement(bodyMeasurementId);
    } catch {
      Alert.alert('Could not delete the measurement', 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TextButton label="Add" accessibilityLabel="Add measurement" onPress={openNewMeasurement} />
          ),
        }}
      />
      {measurements === null ? (
        hasLoadFailed ? (
          <EmptyState title="Could not load measurements" message="Something went wrong. Please try again." />
        ) : null
      ) : measurements.length === 0 ? (
        <EmptyState
          title="Body measurements"
          message="No measurements yet. Add your first one."
          actionLabel="Add measurement"
          onAction={openNewMeasurement}
        />
      ) : (
        <List
          data={measurements}
          keyExtractor={(measurement) => String(measurement.id)}
          renderItem={({ item }) => <MeasurementRow measurement={item} onDelete={() => deleteMeasurement(item.id)} />}
        />
      )}
    </>
  );
}
