import { useState } from 'react';

import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type ExerciseRowProperties = {
  name: string;
  imageUrl: string | null;
  onPress?: () => void;
};

const imageSize = 88;

export function ExerciseRow({ name, imageUrl, onPress }: ExerciseRowProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;

  const row = (
    <Card padding="small">
      <Stack direction="horizontal" gap="medium" align="center">
        {showsImage ? (
          <Image
            source={{ uri: imageUrl }}
            contentFit="cover"
            style={{ width: imageSize, height: imageSize, borderRadius: theme.radii.medium }}
            onError={() => setFailedImageUrl(imageUrl)}
          />
        ) : (
          <NuggieImage name="workout" size={imageSize} shape="rounded" />
        )}
        <Box flex={1}>
          <Typography variant="label">{name}</Typography>
        </Box>
      </Stack>
    </Card>
  );

  if (!onPress) {
    return row;
  }

  return (
    <Touchable onPress={onPress} accessibilityLabel={name}>
      {row}
    </Touchable>
  );
}
