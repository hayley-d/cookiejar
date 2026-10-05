import { useState } from 'react';

import { FormField } from '@/components/molecules/FormField';
import { Image } from '@/components/primitives/Image';
import { Stack } from '@/components/primitives/Stack';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import { isPreviewableImageUrl } from '@/images/imageUrls';
import { useTheme } from '@/theme/useTheme';

type ImageUrlFieldProperties = {
  imageUrl: string;
  error?: string;
  onChangeImageUrl: (imageUrl: string) => void;
};

const previewSize = 160;

type ImagePreviewProperties = {
  imageUrl: string;
};

function ImagePreview({ imageUrl }: ImagePreviewProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  return (
    <Stack gap="small">
      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{ width: previewSize, height: previewSize, borderRadius: theme.radii.large }}
        accessibilityLabel="Image preview"
        onLoad={() => setFailedImageUrl(null)}
        onError={() => setFailedImageUrl(imageUrl)}
      />
      {failedImageUrl === imageUrl ? (
        <Typography variant="caption" color="textSecondary">
          Couldn&apos;t load this image
        </Typography>
      ) : null}
    </Stack>
  );
}

export function ImageUrlField({ imageUrl, error, onChangeImageUrl }: ImageUrlFieldProperties) {
  return (
    <FormField label="Image URL" error={error}>
      <TextField
        value={imageUrl}
        onChangeText={onChangeImageUrl}
        placeholder="https://"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel="Image URL"
      />
      {isPreviewableImageUrl(imageUrl) ? <ImagePreview imageUrl={imageUrl.trim()} /> : null}
    </FormField>
  );
}
