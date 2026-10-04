import { useState, type ReactNode } from 'react';

import { ChipGroup } from '@/components/molecules/ChipGroup';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { Image } from '@/components/primitives/Image';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Stack } from '@/components/primitives/Stack';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import {
  isPreviewableImageUrl,
  type ExerciseFormErrors,
  type ExerciseFormValues,
} from '@/exercises/validateExerciseForm';
import { useTheme } from '@/theme/useTheme';
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

const previewSize = 160;

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

type ImagePreviewProperties = {
  imageUrl: string;
};

function ImagePreview({ imageUrl }: ImagePreviewProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  return (
    <Stack gap="small">
      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{ width: previewSize, height: previewSize, borderRadius: theme.radii.large }}
        accessibilityLabel="Image preview"
        onLoad={() => setFailedImageUrl(null)}
        onError={() => setFailedImageUrl(imageUrl)}
      />
      {failedImageUrl === imageUrl ? (
        <Typography variant="caption" color="textSecondary">
          Couldn&apos;t load this image
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
      <FormField label="Image URL" error={errors.imageUrl}>
        <TextField
          value={values.imageUrl}
          onChangeText={(imageUrl) => onChangeValues({ ...values, imageUrl })}
          placeholder="https://"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          accessibilityLabel="Image URL"
        />
        {isPreviewableImageUrl(values.imageUrl) ? <ImagePreview imageUrl={values.imageUrl.trim()} /> : null}
      </FormField>
      {footer}
    </ScrollBox>
  );
}
