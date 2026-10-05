import { useState } from 'react';

import { NuggieImage } from '@/components/atoms/NuggieImage';
import { TimeLabel } from '@/components/atoms/TimeLabel';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';
import { formatTimeOfDay } from '@/plans/timeOfDay';
import { useTheme } from '@/theme/useTheme';

type PlanEntryRowProperties = {
  timeOfDay: string;
  name: string;
  detail: string;
  imageUrl: string | null;
  nuggie: NuggieName;
};

export function PlanEntryRow({ timeOfDay, name, detail, imageUrl, nuggie }: PlanEntryRowProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;

  return (
    <Stack
      direction="horizontal"
      gap="medium"
      align="center"
      accessible
      accessibilityLabel={`${formatTimeOfDay(timeOfDay)}, ${name}, ${detail}`}
    >
      <TimeLabel timeOfDay={timeOfDay} />
      {showsImage ? (
        <Image
          source={{ uri: imageUrl }}
          contentFit="cover"
          style={{
            width: theme.sizes.planEntryImage,
            height: theme.sizes.planEntryImage,
            borderRadius: theme.radii.medium,
          }}
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <NuggieImage name={nuggie} size={theme.sizes.planEntryImage} shape="rounded" />
      )}
      <Box flex={1}>
        <Typography variant="label" numberOfLines={1}>
          {name}
        </Typography>
      </Box>
      <Typography variant="caption" color="textSecondary">
        {detail}
      </Typography>
    </Stack>
  );
}
