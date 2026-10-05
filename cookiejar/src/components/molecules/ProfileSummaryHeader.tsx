import { NuggieImage } from '@/components/atoms/NuggieImage';
import { TextButton } from '@/components/atoms/TextButton';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { fitnessGoalLabels } from '@/profile/profileLabels';
import type { FitnessGoal } from '@/types/Profile';

type ProfileSummaryHeaderProperties = {
  displayName: string | null;
  goal: FitnessGoal | null;
  weeklyWorkoutTarget: number;
  onPressEdit: () => void;
};

const nuggieSize = 72;

function describeTarget(goal: FitnessGoal | null, weeklyWorkoutTarget: number) {
  const targetText = `${weeklyWorkoutTarget} ${weeklyWorkoutTarget === 1 ? 'workout' : 'workouts'} / week`;
  return goal ? `${fitnessGoalLabels[goal]} · ${targetText}` : targetText;
}

export function ProfileSummaryHeader({
  displayName,
  goal,
  weeklyWorkoutTarget,
  onPressEdit,
}: ProfileSummaryHeaderProperties) {
  return (
    <Box direction="row" align="center" gap="medium">
      <NuggieImage name="profile" size={nuggieSize} />
      <Box flex={1} gap="extraSmall">
        <Typography variant="title">{displayName ?? 'Your profile'}</Typography>
        <Typography color="textSecondary">{describeTarget(goal, weeklyWorkoutTarget)}</Typography>
      </Box>
      <TextButton label="Edit" accessibilityLabel="Edit profile" onPress={onPressEdit} />
    </Box>
  );
}
