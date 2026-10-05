import { useState } from 'react';

import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Image } from '@/components/primitives/Image';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type PersonalRecordRowProperties = {
  exerciseName: string;
  detail: string;
  imageUrl?: string | null;
  recordTypeLabel?: string;
  dateLabel?: string;
  sessionName?: string;
  onPress?: () => void;
};

const trophyIconSize = 18;
const imageSize = 56;

export function PersonalRecordRow({
  exerciseName,
  detail,
  imageUrl,
  recordTypeLabel,
  dateLabel,
  sessionName,
  onPress,
}: PersonalRecordRowProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const isExtended = imageUrl !== undefined || recordTypeLabel !== undefined || dateLabel !== undefined;
  const showsImage = typeof imageUrl === 'string' && imageUrl !== failedImageUrl;

  if (!isExtended) {
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

  const sourceLine = [dateLabel, sessionName].filter((part) => part !== undefined && part !== '').join(' · ');
  const valueLine = recordTypeLabel === undefined ? detail : `${recordTypeLabel} · ${detail}`;

  const content = (
    <Box direction="row" gap="medium" align="center" paddingVertical="small">
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
      <Box flex={1} gap="extraSmall">
        <Typography variant="label">{exerciseName}</Typography>
        <Typography variant="body">{valueLine}</Typography>
        {sourceLine === '' ? null : (
          <Typography variant="caption" color="textSecondary">
            {sourceLine}
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={`${exerciseName}, ${valueLine}, ${sourceLine}`}
      accessibilityHint="Opens the workout summary"
    >
      {content}
    </Touchable>
  );
}
