import { Image as ExpoImage, type ImageContentFit, type ImageSource } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

type ImageProperties = {
  source: ImageSource | number;
  contentFit?: ImageContentFit;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  onLoad?: () => void;
  onError?: () => void;
};

export function Image({ source, contentFit = 'cover', style, accessibilityLabel, onLoad, onError }: ImageProperties) {
  return (
    <ExpoImage
      source={source}
      contentFit={contentFit}
      cachePolicy="disk"
      style={style}
      accessibilityLabel={accessibilityLabel}
      onLoad={onLoad ? () => onLoad() : undefined}
      onError={onError ? () => onError() : undefined}
    />
  );
}
