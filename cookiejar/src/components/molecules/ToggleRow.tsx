import { Box } from '@/components/primitives/Box';
import { Switch } from '@/components/primitives/Switch';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type ToggleRowProperties = {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleRow({ title, subtitle, value, onValueChange }: ToggleRowProperties) {
  const theme = useTheme();

  return (
    <Box
      direction="row"
      align="center"
      justify="space-between"
      gap="medium"
      paddingVertical="medium"
      style={{ borderBottomWidth: theme.sizes.rowDividerWidth, borderBottomColor: theme.colors.border }}
    >
      <Box flex={1} gap="extraSmall">
        <Typography variant="label">{title}</Typography>
        {subtitle ? (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={title} />
    </Box>
  );
}
