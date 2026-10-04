import { View } from 'react-native';

import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type BadgeProperties = {
  label: string;
};

export function Badge({ label }: BadgeProperties) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.accentSoft,
        borderRadius: theme.radii.round,
        paddingHorizontal: theme.spacing.small + theme.spacing.extraSmall,
        paddingVertical: theme.spacing.extraSmall,
      }}
    >
      <Typography variant="caption" color="textPrimary">
        {label}
      </Typography>
    </View>
  );
}
