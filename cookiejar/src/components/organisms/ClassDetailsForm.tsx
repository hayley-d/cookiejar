import { ChipGroup } from '@/components/molecules/ChipGroup';
import { FormField } from '@/components/molecules/FormField';
import { ImageUrlField } from '@/components/molecules/ImageUrlField';
import { Stepper } from '@/components/molecules/Stepper';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { classTypeLabels, classTypes } from '@/types/ClassType';
import { classTypeNuggie } from '@/workouts/classTypeNuggie';
import type { ClassDetails } from '@/workouts/workoutEditorReducer';

export type ClassDetailsErrors = {
  imageUrl?: string;
};

type ClassDetailsFormProperties = {
  classDetails: ClassDetails;
  errors: ClassDetailsErrors;
  onChangeClassDetails: (changes: Partial<ClassDetails>) => void;
};

const classTypeOptions = classTypes.map((classType) => ({
  value: classType,
  label: classTypeLabels[classType],
  nuggie: classTypeNuggie(classType),
}));

const durationStepMinutes = 5;
const minimumDurationMinutes = 5;
const maximumDurationMinutes = 240;
const descriptionMinimumHeight = 96;

function formatMinutes(minutes: number) {
  return `${minutes} min`;
}

export function ClassDetailsForm({ classDetails, errors, onChangeClassDetails }: ClassDetailsFormProperties) {
  return (
    <ScrollBox gap="large">
      <FormField label="Class type">
        <ChipGroup
          options={classTypeOptions}
          selectedValue={classDetails.classType}
          onSelect={(classType) => onChangeClassDetails({ classType })}
        />
      </FormField>
      <FormField label="Duration">
        <Stepper
          value={classDetails.durationMinutes}
          step={durationStepMinutes}
          minimum={minimumDurationMinutes}
          maximum={maximumDurationMinutes}
          accessibilityLabel="Duration"
          formatValue={formatMinutes}
          onChangeValue={(durationMinutes) => onChangeClassDetails({ durationMinutes })}
        />
      </FormField>
      <FormField label="Description">
        <TextField
          value={classDetails.description}
          onChangeText={(description) => onChangeClassDetails({ description })}
          placeholder="Optional"
          multiline
          textAlignVertical="top"
          accessibilityLabel="Description"
          style={{ minHeight: descriptionMinimumHeight }}
        />
      </FormField>
      <ImageUrlField
        imageUrl={classDetails.imageUrl}
        error={errors.imageUrl}
        onChangeImageUrl={(imageUrl) => onChangeClassDetails({ imageUrl })}
      />
    </ScrollBox>
  );
}
