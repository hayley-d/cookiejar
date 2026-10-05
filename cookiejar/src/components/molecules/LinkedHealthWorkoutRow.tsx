import { TextButton } from '@/components/atoms/TextButton';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { formatHeartRatePair, formatKilocalories, formatWorkoutDuration } from '@/health/formatWorkoutValues';

type LinkedHealthWorkoutRowProperties = {
  averageHeartRate: number | null;
  maximumHeartRate: number | null;
  activeKilocalories: number | null;
  durationSeconds: number | null;
  onUnlink: () => void;
};

export function LinkedHealthWorkoutRow({
  averageHeartRate,
  maximumHeartRate,
  activeKilocalories,
  durationSeconds,
  onUnlink,
}: LinkedHealthWorkoutRowProperties) {
  return (
    <Box gap="small">
      <Box direction="row" justify="space-between" align="center">
        <Typography variant="heading">Garmin</Typography>
        <TextButton label="Unlink" onPress={onUnlink} />
      </Box>
      <Box direction="row" gap="medium" style={{ flexWrap: 'wrap' }}>
        <Typography>{`❤️ ${formatHeartRatePair(averageHeartRate, maximumHeartRate)}`}</Typography>
        <Typography>{`🔥 ${formatKilocalories(activeKilocalories)}`}</Typography>
        <Typography>{`⏱ ${formatWorkoutDuration(durationSeconds)}`}</Typography>
      </Box>
    </Box>
  );
}
