import { useVideoPlayer, VideoView } from 'expo-video';
import type { StyleProp, ViewStyle } from 'react-native';

type VideoProperties = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Video({ uri, style, accessibilityLabel }: VideoProperties) {
  const player = useVideoPlayer(uri, (createdPlayer) => {
    createdPlayer.loop = true;
    createdPlayer.muted = true;
    createdPlayer.play();
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="contain"
      nativeControls
      fullscreenOptions={{ enable: true }}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
