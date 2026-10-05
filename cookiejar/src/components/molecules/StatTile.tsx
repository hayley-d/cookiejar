import { Card } from '@/components/atoms/Card';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type StatTileProperties = {
  value: string;
  label: string;
};

export function StatTile({ value, label }: StatTileProperties) {
  const theme = useTheme();

  return (
    <Card
      padding="small"
      accessible
      accessibilityLabel={`${label} ${value}`}
      style={{ flex: 1, minHeight: theme.sizes.statTileMinimumHeight, justifyContent: 'center' }}
    >
      <Typography variant="heading" align="center">
        {value}
      </Typography>
      <Typography variant="caption" color="textSecondary" align="center">
        {label}
      </Typography>
    </Card>
  );
}
