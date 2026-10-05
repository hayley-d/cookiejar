import { router, Stack } from 'expo-router';

import { TextButton } from '@/components/atoms/TextButton';
import { MeasurementForm } from '@/components/organisms/MeasurementForm';
import { useMeasurementForm } from '@/hooks/useMeasurementForm';

export default function NewMeasurementScreen() {
  const measurementForm = useMeasurementForm({ onSaved: () => router.back() });

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <TextButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => (
            <TextButton label="Save" onPress={measurementForm.save} disabled={measurementForm.isSaving} />
          ),
        }}
      />
      <MeasurementForm
        values={measurementForm.values}
        errors={measurementForm.errors}
        onChangeValues={measurementForm.changeValues}
      />
    </>
  );
}
