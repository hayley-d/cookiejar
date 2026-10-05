import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type StatBarRowProperties = {
  dateLabel: string;
  valueText: string;
  fraction: number;
};

export function StatBarRow({ dateLabel, valueText, fraction }: StatBarRowProperties) {
  const theme = useTheme();

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      accessible
      accessibilityLabel={`${dateLabel}, ${valueText}`}
    >
      <Box style={{ width: theme.sizes.statBarDateColumn }}>
        <Typography variant="caption" color="textSecondary">
          {dateLabel}
        </Typography>
      </Box>
      <Box flex={1} background="accentSoft" radius="round" style={{ height: theme.sizes.statBarHeight }}>
        <Box
          background="accent"
          radius="round"
          style={{ height: theme.sizes.statBarHeight, width: `${Math.round(fraction * 100)}%` }}
        />
      </Box>
      <Box style={{ width: theme.sizes.statBarValueColumn }} align="flex-end">
        <Typography variant="label">{valueText}</Typography>
      </Box>
    </Box>
  );
}
