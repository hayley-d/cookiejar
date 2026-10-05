import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

type ProgressRingBoxProperties = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
};

export function ProgressRingBox({ progress, size, strokeWidth, children }: ProgressRingBoxProperties) {
  const theme = useTheme();
  const ringSize = size ?? theme.sizes.classRing;
  const ringStrokeWidth = strokeWidth ?? theme.sizes.classRingStroke;
  const radius = (ringSize - ringStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const center = ringSize / 2;

  return (
    <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={ringSize} height={ringSize} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.colors.accentSoft}
          strokeWidth={ringStrokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.colors.accent}
          strokeWidth={ringStrokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clampedProgress)}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children}
    </View>
  );
}
