import { NumberInput } from '@/components/atoms/NumberInput';
import { FormField } from '@/components/molecules/FormField';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TimePickerBox } from '@/components/primitives/TimePickerBox';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { measurementDecimalPlaces } from '@/measurements/measurementFormRules';
import type {
  MeasurementFormErrors,
  MeasurementFormValues,
  MeasurementValueField,
} from '@/measurements/validateMeasurementForm';

type MeasurementFormProperties = {
  values: MeasurementFormValues;
  errors: MeasurementFormErrors;
  onChangeValues: (values: MeasurementFormValues) => void;
};

type ValueFieldDescription = {
  field: MeasurementValueField;
  label: string;
  accessibilityLabel: string;
};

const valueFieldDescriptions: ValueFieldDescription[] = [
  { field: 'weightKilograms', label: 'Weight (kg)', accessibilityLabel: 'Weight in kilograms' },
  { field: 'bodyFatPercent', label: 'Body fat (%)', accessibilityLabel: 'Body fat percent' },
  { field: 'waistCentimetres', label: 'Waist (cm)', accessibilityLabel: 'Waist in centimetres' },
  { field: 'hipCentimetres', label: 'Hips (cm)', accessibilityLabel: 'Hips in centimetres' },
  { field: 'chestCentimetres', label: 'Chest (cm)', accessibilityLabel: 'Chest in centimetres' },
];

export function MeasurementForm({ values, errors, onChangeValues }: MeasurementFormProperties) {
  return (
    <ScrollBox gap="large">
      <FormField label="Date" error={errors.measuredOn}>
        <TimePickerBox
          mode="date"
          value={parseLocalDateString(values.measuredOn)}
          maximumDate={new Date()}
          accessibilityLabel="Measurement date"
          onChangeValue={(selectedDate) => onChangeValues({ ...values, measuredOn: toLocalDateString(selectedDate) })}
        />
      </FormField>
      {errors.values ? (
        <Typography variant="caption" color="danger">
          {errors.values}
        </Typography>
      ) : null}
      {valueFieldDescriptions.map(({ field, label, accessibilityLabel }) => (
        <FormField key={field} label={label} error={errors[field]}>
          <NumberInput
            value={values[field]}
            decimalPlaces={measurementDecimalPlaces}
            accessibilityLabel={accessibilityLabel}
            onChangeValue={(value) => onChangeValues({ ...values, [field]: value })}
          />
        </FormField>
      ))}
      <FormField label="Notes">
        <TextField
          value={values.notes}
          onChangeText={(notes) => onChangeValues({ ...values, notes })}
          placeholder="Optional"
          multiline
          accessibilityLabel="Notes"
        />
      </FormField>
    </ScrollBox>
  );
}
