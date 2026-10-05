import { useState } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';
import { useTheme } from '@/theme/useTheme';

type WorkoutRowProperties = {
  name: string;
  summary: string;
  imageUrl: string | null;
  nuggie: NuggieName;
  badgeLabel?: string;
  onLongPress?: () => void;
};


export function WorkoutRow({ name, summary, imageUrl, nuggie, badgeLabel, onLongPress }: WorkoutRowProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;

  return (
    <Touchable
      onLongPress={onLongPress}
      accessibilityLabel={`${name}, ${summary}`}
      accessibilityHint="Long press for edit, duplicate and delete"
    >
      <Card padding="small">
        <Stack direction="horizontal" gap="medium" align="center">
          {showsImage ? (
            <Image
              source={{ uri: imageUrl }}
              contentFit="cover"
              style={{
                width: theme.sizes.workoutRowImage,
                height: theme.sizes.workoutRowImage,
                borderRadius: theme.radii.medium,
              }}
              onError={() => setFailedImageUrl(imageUrl)}
            />
          ) : (
            <NuggieImage name={nuggie} size={theme.sizes.workoutRowImage} shape="rounded" />
          )}
          <Box flex={1} gap="extraSmall">
            <Typography variant="label">{name}</Typography>
            {badgeLabel ? <Badge label={badgeLabel} /> : null}
            <Typography variant="caption" color="textSecondary">
              {summary}
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Touchable>
  );
}
