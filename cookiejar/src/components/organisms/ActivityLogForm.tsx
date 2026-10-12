import { NumberInput } from '@/components/atoms/NumberInput';
import { ChipGroup } from '@/components/molecules/ChipGroup';
import { FormField } from '@/components/molecules/FormField';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { TimePickerBox } from '@/components/primitives/TimePickerBox';
import { Typography } from '@/components/primitives/Typography';
import { describePace } from '@/activities/derivePace';
import {
  activityLogDistanceMeters,
  activityLogDurationSeconds,
  type ActivityLogFormErrors,
  type ActivityLogFormValues,
} from '@/activities/validateActivityLogForm';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { activityTypeLabels, activityTypes } from '@/types/ActivityType';
import { activityTypeNuggie } from '@/workouts/activityTypeNuggie';

type ActivityLogFormProperties = {
  values: ActivityLogFormValues;
  errors: ActivityLogFormErrors;
  onChangeValues: (values: ActivityLogFormValues) => void;
};

const activityTypeOptions = activityTypes.map((activityType) => ({
  value: activityType,
  label: activityTypeLabels[activityType],
  nuggie: activityTypeNuggie(activityType),
}));

const notesMinimumHeight = 96;

export function ActivityLogForm({ values, errors, onChangeValues }: ActivityLogFormProperties) {
  const pace = describePace(activityLogDistanceMeters(values), activityLogDurationSeconds(values));

  return (
    <ScrollBox gap="large">
      <FormField label="Activity type">
        <ChipGroup
          options={activityTypeOptions}
          selectedValue={values.activityType}
          onSelect={(activityType) => onChangeValues({ ...values, activityType })}
        />
      </FormField>
      <FormField label="Date">
        <TimePickerBox
          mode="date"
          value={parseLocalDateString(values.date)}
          maximumDate={new Date()}
          accessibilityLabel="Activity date"
          onChangeValue={(selectedDate) => onChangeValues({ ...values, date: toLocalDateString(selectedDate) })}
        />
      </FormField>
      <FormField label="Start time">
        <TimePickerBox
          value={values.startTime}
          accessibilityLabel="Start time"
          onChangeValue={(startTime) => onChangeValues({ ...values, startTime })}
        />
      </FormField>
      <FormField label="Duration" error={errors.duration}>
        <Box direction="row" gap="medium">
          <Box flex={1} gap="small">
            <NumberInput
              value={values.hours}
              decimalPlaces={0}
              placeholder="0"
              accessibilityLabel="Duration hours"
              onChangeValue={(hours) => onChangeValues({ ...values, hours })}
            />
            <Typography variant="caption" color="textSecondary" align="center">
              hours
            </Typography>
          </Box>
          <Box flex={1} gap="small">
            <NumberInput
              value={values.minutes}
              decimalPlaces={0}
              placeholder="0"
              accessibilityLabel="Duration minutes"
              onChangeValue={(minutes) => onChangeValues({ ...values, minutes })}
            />
            <Typography variant="caption" color="textSecondary" align="center">
              minutes
            </Typography>
          </Box>
        </Box>
      </FormField>
      <FormField label="Distance (km)">
        <NumberInput
          value={values.distanceKilometers}
          decimalPlaces={2}
          placeholder="Optional"
          accessibilityLabel="Distance in kilometres"
          onChangeValue={(distanceKilometers) => onChangeValues({ ...values, distanceKilometers })}
        />
      </FormField>
      <FormField label="Elevation gain (m)">
        <NumberInput
          value={values.elevationGainMeters}
          decimalPlaces={0}
          placeholder="Optional"
          accessibilityLabel="Elevation gain in metres"
          onChangeValue={(elevationGainMeters) => onChangeValues({ ...values, elevationGainMeters })}
        />
      </FormField>
      <FormField label="Active calories (kcal)">
        <NumberInput
          value={values.activeKilocalories}
          decimalPlaces={0}
          placeholder="Optional"
          accessibilityLabel="Active calories in kilocalories"
          onChangeValue={(activeKilocalories) => onChangeValues({ ...values, activeKilocalories })}
        />
      </FormField>
      <FormField label="Average heart rate (bpm)">
        <NumberInput
          value={values.averageHeartRate}
          decimalPlaces={0}
          placeholder="Optional"
          accessibilityLabel="Average heart rate in beats per minute"
          onChangeValue={(averageHeartRate) => onChangeValues({ ...values, averageHeartRate })}
        />
      </FormField>
      <Box direction="row" justify="space-between" align="center">
        <Typography variant="label">Pace</Typography>
        <Typography color={pace === null ? 'textSecondary' : 'textPrimary'}>
          {pace ?? 'Add distance and duration'}
        </Typography>
      </Box>
      <FormField label="Notes">
        <TextField
          value={values.notes}
          onChangeText={(notes) => onChangeValues({ ...values, notes })}
          placeholder="Optional"
          multiline
          textAlignVertical="top"
          accessibilityLabel="Notes"
          style={{ minHeight: notesMinimumHeight }}
        />
      </FormField>
    </ScrollBox>
  );
}
