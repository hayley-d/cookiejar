import { useState } from 'react';

import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Image } from '@/components/primitives/Image';
import { Touchable } from '@/components/primitives/Touchable';
import { useTheme } from '@/theme/useTheme';

type ExerciseThumbnailProperties = {
  name: string;
  imageUrl: string | null;
  size: number;
  onPlayVideo?: () => void;
};

export function ExerciseThumbnail({ name, imageUrl, size, onPlayVideo }: ExerciseThumbnailProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;

  const thumbnail = showsImage ? (
    <Image
      source={{ uri: imageUrl }}
      contentFit="cover"
      style={{ width: size, height: size, borderRadius: theme.radii.medium }}
      onError={() => setFailedImageUrl(imageUrl)}
    />
  ) : (
    <NuggieImage name="workout" size={size} shape="rounded" />
  );

  if (!onPlayVideo) {
    return thumbnail;
  }

  return (
    <Touchable onPress={onPlayVideo} accessibilityLabel={`Play ${name} video`} hitSlop={theme.spacing.extraSmall}>
      {thumbnail}
      <Box
        align="center"
        justify="center"
        background="accent"
        radius="round"
        style={{
          position: 'absolute',
          right: theme.spacing.extraSmall,
          bottom: theme.spacing.extraSmall,
          width: theme.sizes.playBadge,
          height: theme.sizes.playBadge,
        }}
      >
        <Icon name="play.fill" size={theme.sizes.playBadgeIcon} color="onAccent" />
      </Box>
    </Touchable>
  );
}
