import { useState } from 'react';

import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import type { NuggieName } from '@/nuggies/NuggieName';
import { useTheme } from '@/theme/useTheme';

type HeaderImageCardProperties = {
  imageUrl: string | null;
  nuggie: NuggieName;
  background?: 'surface' | 'accentSoft';
};

export function HeaderImageCard({ imageUrl, nuggie, background = 'surface' }: HeaderImageCardProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;

  return (
    <Box
      align="center"
      justify="center"
      background={background}
      radius="large"
      style={[{ height: theme.sizes.headerCardImageHeight, overflow: 'hidden' }, theme.shadows.card]}
    >
      {showsImage ? (
        <Image
          source={{ uri: imageUrl }}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <NuggieImage name={nuggie} size={theme.sizes.headerCardNuggie} />
      )}
    </Box>
  );
}
