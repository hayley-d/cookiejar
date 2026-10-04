import { View } from 'react-native';

import { Image } from '@/components/primitives/Image';
import { nuggieImages } from '@/nuggies/nuggieImages';
import type { NuggieName } from '@/nuggies/NuggieName';
import { useTheme } from '@/theme/useTheme';

type NuggieImageProperties = {
  name: NuggieName;
  size: number;
  shape?: 'circle' | 'rounded';
};

const frameWidth = 3;

export function NuggieImage({ name, size, shape = 'circle' }: NuggieImageProperties) {
  const theme = useTheme();
  const borderRadius = shape === 'circle' ? size / 2 : theme.radii.large;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        borderWidth: frameWidth,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <Image source={nuggieImages[name]} contentFit="cover" style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
