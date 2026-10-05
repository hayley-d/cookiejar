import type { ReactNode } from 'react';
import { View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type SwipeableBoxProperties = {
  children: ReactNode;
  actionLabel: string;
  onSwipeLeft: () => void;
};

const swipeFriction = 2;

export function SwipeableBox({ children, actionLabel, onSwipeLeft }: SwipeableBoxProperties) {
  const theme = useTheme();

  return (
    <ReanimatedSwipeable
      friction={swipeFriction}
      overshootRight={false}
      onSwipeableOpen={onSwipeLeft}
      renderRightActions={() => (
        <View
          style={{
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.medium,
            backgroundColor: theme.colors.danger,
            borderRadius: theme.radii.small,
          }}
        >
          <Typography variant="label" color="onAccent">
            {actionLabel}
          </Typography>
        </View>
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}
