import { DatePickerField } from '@/components/atoms/DatePickerField';
import { ChipGroup } from '@/components/molecules/ChipGroup';
import { FormField } from '@/components/molecules/FormField';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { Stepper } from '@/components/molecules/Stepper';
import { NumberInput } from '@/components/atoms/NumberInput';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import {
  maximumHeightCentimetres,
  maximumStepGoal,
  maximumWeeklyWorkoutTarget,
  minimumStepGoal,
  minimumWeeklyWorkoutTarget,
  stepGoalIncrement,
} from '@/profile/profileFormRules';
import { fitnessGoalLabels, fitnessGoals, sexes, sexLabels } from '@/profile/profileLabels';
import type { ProfileFormErrors, ProfileFormValues } from '@/profile/validateProfileForm';

type ProfileFormProperties = {
  values: ProfileFormValues;
  errors: ProfileFormErrors;
  onChangeValues: (values: ProfileFormValues) => void;
};

const sexSegments = sexes.map((sex) => ({ value: sex, label: sexLabels[sex] }));

const goalOptions = fitnessGoals.map((goal) => ({ value: goal, label: fitnessGoalLabels[goal] }));

function formatWeeklyTarget(weeklyWorkoutTarget: number) {
  return `${weeklyWorkoutTarget} ${weeklyWorkoutTarget === 1 ? 'workout' : 'workouts'}`;
}

function formatStepGoal(dailyStepGoal: number) {
  return `${dailyStepGoal.toLocaleString('en-US')} steps`;
}

export function ProfileForm({ values, errors, onChangeValues }: ProfileFormProperties) {
  return (
    <ScrollBox gap="large">
      <FormField label="Name">
        <TextField
          value={values.displayName}
          onChangeText={(displayName) => onChangeValues({ ...values, displayName })}
          placeholder="What should we call you?"
          autoCapitalize="words"
          returnKeyType="done"
          accessibilityLabel="Name"
        />
      </FormField>
      <FormField label="Birth date" error={errors.birthDate}>
        <DatePickerField
          value={values.birthDate}
          accessibilityLabel="Birth date"
          maximumDate={new Date()}
          onChangeValue={(birthDate) => onChangeValues({ ...values, birthDate })}
        />
      </FormField>
      <FormField label="Sex">
        <SegmentedControl
          segments={sexSegments}
          selectedValue={values.sex}
          onSelect={(sex) => onChangeValues({ ...values, sex })}
        />
      </FormField>
      <FormField label="Height (cm)" error={errors.heightCentimetres}>
        <NumberInput
          value={values.heightCentimetres}
          decimalPlaces={1}
          placeholder={`Up to ${maximumHeightCentimetres}`}
          accessibilityLabel="Height in centimetres"
          onChangeValue={(heightCentimetres) => onChangeValues({ ...values, heightCentimetres })}
        />
      </FormField>
      <FormField label="Main goal">
        <ChipGroup
          options={goalOptions}
          selectedValue={values.goal}
          onSelect={(goal) => onChangeValues({ ...values, goal })}
        />
      </FormField>
      <FormField label="Weekly workout target" error={errors.weeklyWorkoutTarget}>
        <Stepper
          value={values.weeklyWorkoutTarget}
          step={1}
          minimum={minimumWeeklyWorkoutTarget}
          maximum={maximumWeeklyWorkoutTarget}
          accessibilityLabel="Weekly workout target"
          formatValue={formatWeeklyTarget}
          onChangeValue={(weeklyWorkoutTarget) => onChangeValues({ ...values, weeklyWorkoutTarget })}
        />
      </FormField>
      <FormField label="Daily step goal" error={errors.dailyStepGoal}>
        <Stepper
          value={values.dailyStepGoal}
          step={stepGoalIncrement}
          minimum={minimumStepGoal}
          maximum={maximumStepGoal}
          accessibilityLabel="Daily step goal"
          formatValue={formatStepGoal}
          onChangeValue={(dailyStepGoal) => onChangeValues({ ...values, dailyStepGoal })}
        />
      </FormField>
    </ScrollBox>
  );
}
