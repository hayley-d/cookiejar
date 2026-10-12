import { ChipGroup } from '@/components/molecules/ChipGroup';
import { FormField } from '@/components/molecules/FormField';
import { ImageUrlField } from '@/components/molecules/ImageUrlField';
import { WorkoutNameField, type WorkoutNameFieldProperties } from '@/components/molecules/WorkoutNameField';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { activityTypeLabels, activityTypes } from '@/types/ActivityType';
import { activityTypeNuggie } from '@/workouts/activityTypeNuggie';
import type { ActivityDetails } from '@/workouts/workoutEditorReducer';

export type ActivityDetailsErrors = {
  imageUrl?: string;
};

type ActivityDetailsFormProperties = {
  workoutName?: WorkoutNameFieldProperties;
  activityDetails: ActivityDetails;
  errors: ActivityDetailsErrors;
  onChangeActivityDetails: (changes: Partial<ActivityDetails>) => void;
};

const activityTypeOptions = activityTypes.map((activityType) => ({
  value: activityType,
  label: activityTypeLabels[activityType],
  nuggie: activityTypeNuggie(activityType),
}));

const descriptionMinimumHeight = 96;

export function ActivityDetailsForm({
  workoutName,
  activityDetails,
  errors,
  onChangeActivityDetails,
}: ActivityDetailsFormProperties) {
  return (
    <ScrollBox gap="large">
      {workoutName === undefined ? null : <WorkoutNameField {...workoutName} />}
      <FormField label="Activity type">
        <ChipGroup
          options={activityTypeOptions}
          selectedValue={activityDetails.activityType}
          onSelect={(activityType) => onChangeActivityDetails({ activityType })}
        />
      </FormField>
      <FormField label="Description">
        <TextField
          value={activityDetails.description}
          onChangeText={(description) => onChangeActivityDetails({ description })}
          placeholder="Optional"
          multiline
          textAlignVertical="top"
          accessibilityLabel="Description"
          style={{ minHeight: descriptionMinimumHeight }}
        />
      </FormField>
      <ImageUrlField
        imageUrl={activityDetails.imageUrl}
        error={errors.imageUrl}
        onChangeImageUrl={(imageUrl) => onChangeActivityDetails({ imageUrl })}
      />
    </ScrollBox>
  );
}
