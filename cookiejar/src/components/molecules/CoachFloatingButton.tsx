import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { View } from 'react-native';

import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type CoachFloatingButtonProperties = {
  tipText?: string;
};

const ringWidth = 3;

export function CoachFloatingButton({ tipText }: CoachFloatingButtonProperties) {
  const theme = useTheme();
  const buttonSize = theme.sizes.coachButton;

  const openCoach = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/coach');
  };

  return (
    <View>
      {tipText ? (
        <Touchable
          onPress={openCoach}
          accessibilityLabel={tipText}
          style={[
            {
              position: 'absolute',
              right: buttonSize + theme.spacing.small,
              top: 0,
              maxWidth: 220,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.large,
              padding: theme.spacing.small + theme.spacing.extraSmall,
            },
            theme.shadows.card,
          ]}
        >
          <Typography variant="caption">{tipText}</Typography>
        </Touchable>
      ) : null}
      <Touchable
        onPress={openCoach}
        accessibilityLabel="Open Coach Nuggie"
        style={[
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            borderWidth: ringWidth,
            borderColor: theme.colors.accent,
            backgroundColor: theme.colors.surface,
          },
          theme.shadows.card,
        ]}
      >
        <NuggieImage name="coach" size={buttonSize - ringWidth * 2} />
      </Touchable>
    </View>
  );
}
