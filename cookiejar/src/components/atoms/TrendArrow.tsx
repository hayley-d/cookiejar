import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Typography } from '@/components/primitives/Typography';
import type { AverageComparisonDirection, AverageComparisonTone } from '@/health/compareToAverage';
import type { ColorName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type TrendArrowProperties = {
  direction: AverageComparisonDirection;
  difference: number;
  tone?: AverageComparisonTone;
};

const directionSymbols = {
  up: 'arrow.up',
  down: 'arrow.down',
  level: 'equal',
} as const;

const toneColors: Record<AverageComparisonTone, ColorName> = {
  default: 'textSecondary',
  positive: 'success',
  attention: 'attention',
};

export function TrendArrow({ direction, difference, tone = 'default' }: TrendArrowProperties) {
  const theme = useTheme();
  const color = toneColors[tone];
  const absoluteDifference = Math.abs(difference);

  return (
    <Box
      direction="row"
      align="center"
      gap="extraSmall"
      accessible
      accessibilityLabel={`${direction} ${absoluteDifference}`}
    >
      <Icon name={directionSymbols[direction]} size={theme.sizes.statTileIcon} color={color} weight="bold" />
      <Typography variant="caption" color={color}>
        {absoluteDifference}
      </Typography>
    </Box>
  );
}
