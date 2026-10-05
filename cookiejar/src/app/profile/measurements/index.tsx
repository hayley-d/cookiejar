import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Card } from '@/components/atoms/Card';
import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { MeasurementRow } from '@/components/molecules/MeasurementRow';
import { RangeSwitcher } from '@/components/molecules/RangeSwitcher';
import { ProgressLineChart } from '@/components/organisms/ProgressLineChart';
import { Box } from '@/components/primitives/Box';
import { List } from '@/components/primitives/List';
import { Typography } from '@/components/primitives/Typography';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { useProfile } from '@/hooks/useProfile';
import { calculateBodyMassIndex } from '@/progress/calculateBodyMassIndex';
import { filterPointsToRange } from '@/progress/progressRanges';
import { selectWeightPoints } from '@/progress/selectWeightPoints';

const weightRanges = ['thirtyDays', 'ninetyDays', 'oneYear'] as const;

type WeightRange = (typeof weightRanges)[number];

function openNewMeasurement() {
  router.push('/profile/measurements/new');
}

export default function MeasurementsScreen() {
  const { measurements, hasLoadFailed, removeMeasurement } = useBodyMeasurements();
  const { heightCentimetres } = useProfile();
  const [weightRange, setWeightRange] = useState<WeightRange>('thirtyDays');
  const today = toLocalDateString(new Date());
  const weightPoints = measurements === null ? [] : selectWeightPoints(measurements, today);
  const weightPointsInRange = filterPointsToRange(weightPoints, weightRange, today);
  const latestWeightPoint = weightPoints.length === 0 ? null : weightPoints[weightPoints.length - 1];
  const bodyMassIndex = calculateBodyMassIndex(latestWeightPoint?.value ?? null, heightCentimetres);

  const weightHeader =
    latestWeightPoint === null ? null : (
      <Card>
        <Box gap="small">
          <Typography variant="heading">Weight</Typography>
          <RangeSwitcher ranges={weightRanges} selectedRange={weightRange} onSelect={setWeightRange} />
          {weightPointsInRange.length >= 2 ? (
            <ProgressLineChart points={weightPointsInRange} unit="kg" />
          ) : (
            <Box gap="extraSmall" paddingVertical="small">
              <Typography variant="display">{`${latestWeightPoint.value} kg`}</Typography>
              <Typography variant="caption" color="textSecondary">
                Latest weight
              </Typography>
            </Box>
          )}
          {bodyMassIndex === null ? null : (
            <Typography variant="caption" color="textSecondary">{`BMI ${bodyMassIndex}`}</Typography>
          )}
        </Box>
      </Card>
    );

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
          ListHeaderComponent={weightHeader}
          keyExtractor={(measurement) => String(measurement.id)}
          renderItem={({ item }) => <MeasurementRow measurement={item} onDelete={() => deleteMeasurement(item.id)} />}
        />
      )}
    </>
  );
}
