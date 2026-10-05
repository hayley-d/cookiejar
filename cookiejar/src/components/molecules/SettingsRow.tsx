import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type SettingsRowProperties = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

const chevronSize = 14;

export function SettingsRow({ title, subtitle, onPress }: SettingsRowProperties) {
  const theme = useTheme();

  const content = (
    <Box
      direction="row"
      align="center"
      justify="space-between"
      gap="medium"
      paddingVertical="medium"
      style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
    >
      <Box flex={1} gap="extraSmall">
        <Typography variant="label">{title}</Typography>
        {subtitle ? (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {onPress ? <Icon name="chevron.right" size={chevronSize} color="textSecondary" weight="semibold" /> : null}
    </Box>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Touchable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      {content}
    </Touchable>
  );
}
