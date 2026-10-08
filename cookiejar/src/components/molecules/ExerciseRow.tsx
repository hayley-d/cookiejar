import { Card } from '@/components/atoms/Card';
import { Checkbox } from '@/components/atoms/Checkbox';
import { ExerciseThumbnail } from '@/components/atoms/ExerciseThumbnail';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';

type ExerciseRowProperties = {
  name: string;
  caption?: string;
  imageUrl: string | null;
  onPress?: () => void;
  onPlayVideo?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
};

const imageSize = 88;

export function ExerciseRow({
  name,
  caption,
  imageUrl,
  onPress,
  onPlayVideo,
  isSelected,
  disabled,
}: ExerciseRowProperties) {

  const row = (
    <Card padding="small">
      <Stack direction="horizontal" gap="medium" align="center">
        <ExerciseThumbnail name={name} imageUrl={imageUrl} size={imageSize} onPlayVideo={onPlayVideo} />
        <Box flex={1} gap="extraSmall">
          <Typography variant="label">{name}</Typography>
          {caption === undefined ? null : (
            <Typography variant="caption" color="textSecondary">
              {caption}
            </Typography>
          )}
        </Box>
        {isSelected === undefined ? null : <Checkbox isChecked={isSelected} />}
      </Stack>
    </Card>
  );

  if (!onPress) {
    return row;
  }

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={name}
      accessibilityRole={isSelected === undefined ? 'button' : 'checkbox'}
      accessibilityState={{ checked: isSelected, disabled }}
    >
      {row}
    </Touchable>
  );
}
