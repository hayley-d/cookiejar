import { Button } from '@/components/atoms/Button';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { Video } from '@/components/primitives/Video';
import { useTheme } from '@/theme/useTheme';

type ExerciseVideoSheetProperties = {
  exerciseName: string;
  videoUrl: string;
  onClose: () => void;
};

export function ExerciseVideoSheet({ exerciseName, videoUrl, onClose }: ExerciseVideoSheetProperties) {
  const theme = useTheme();

  return (
    <Box padding="large">
      <Stack gap="medium">
        <Typography variant="title">{exerciseName}</Typography>
        <Box radius="large" background="surface" style={{ overflow: 'hidden' }}>
          <Video
            uri={videoUrl}
            accessibilityLabel={`${exerciseName} demonstration video`}
            style={{ width: '100%', aspectRatio: theme.sizes.exerciseVideoAspectRatio }}
          />
        </Box>
        <Button label="Done" onPress={onClose} />
      </Stack>
    </Box>
  );
}
