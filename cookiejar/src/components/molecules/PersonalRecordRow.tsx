import { Icon } from '@/components/primitives/Icon';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

type PersonalRecordRowProperties = {
  exerciseName: string;
  detail: string;
};

const trophyIconSize = 18;

export function PersonalRecordRow({ exerciseName, detail }: PersonalRecordRowProperties) {
  return (
    <Box direction="row" gap="small" align="center" accessible accessibilityLabel={`${exerciseName}, ${detail}`}>
      <Icon name="trophy.fill" size={trophyIconSize} color="accent" />
      <Typography variant="body" style={{ flex: 1 }}>
        <Typography variant="label">{exerciseName}</Typography>
        {` — ${detail}`}
      </Typography>
    </Box>
  );
}
