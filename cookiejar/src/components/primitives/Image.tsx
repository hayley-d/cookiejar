import { Image as ExpoImage, type ImageContentFit, type ImageSource } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

type ImageProperties = {
  source: ImageSource | number;
  contentFit?: ImageContentFit;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function Image({ source, contentFit = 'cover', style, accessibilityLabel }: ImageProperties) {
  return (
    <ExpoImage
      source={source}
      contentFit={contentFit}
      cachePolicy="disk"
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
