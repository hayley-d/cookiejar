import type { ReactNode } from 'react';

import { ChipGroup } from '@/components/molecules/ChipGroup';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Stack } from '@/components/primitives/Stack';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import type { ExerciseFormErrors, ExerciseFormValues } from '@/exercises/validateExerciseForm';
import { bodyPartLabels, bodyParts } from '@/types/BodyPart';
import { trackingTypeLabels, trackingTypes } from '@/types/TrackingType';

type ExerciseFormProperties = {
  values: ExerciseFormValues;
  errors: ExerciseFormErrors;
  onChangeValues: (values: ExerciseFormValues) => void;
  footer?: ReactNode;
};

const bodyPartOptions = bodyParts.map((bodyPart) => ({ value: bodyPart, label: bodyPartLabels[bodyPart] }));

const trackingTypeSegments = trackingTypes.map((trackingType) => ({
  value: trackingType,
  label: trackingTypeLabels[trackingType],
}));

type FormFieldProperties = {
  label: string;
  error?: string;
  children: ReactNode;
};

function FormField({ label, error, children }: FormFieldProperties) {
  return (
    <Stack gap="small">
      <Typography variant="label">{label}</Typography>
      {children}
      {error ? (
        <Typography variant="caption" color="danger">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function ExerciseForm({ values, errors, onChangeValues, footer }: ExerciseFormProperties) {
  return (
    <ScrollBox gap="large">
      <FormField label="Name" error={errors.name}>
        <TextField
          value={values.name}
          onChangeText={(name) => onChangeValues({ ...values, name })}
          placeholder="e.g. Hip Thrust"
          autoCapitalize="words"
          returnKeyType="done"
          accessibilityLabel="Name"
        />
      </FormField>
      <FormField label="Body part" error={errors.bodyPart}>
        <ChipGroup
          options={bodyPartOptions}
          selectedValue={values.bodyPart}
          onSelect={(bodyPart) => onChangeValues({ ...values, bodyPart })}
        />
      </FormField>
      <FormField label="Usually measured by" error={errors.defaultTrackingType}>
        <SegmentedControl
          segments={trackingTypeSegments}
          selectedValue={values.defaultTrackingType}
          onSelect={(defaultTrackingType) => onChangeValues({ ...values, defaultTrackingType })}
        />
      </FormField>
      {footer}
    </ScrollBox>
  );
}
