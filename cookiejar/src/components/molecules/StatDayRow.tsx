import { StreakDots } from '@/components/atoms/StreakDots';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { StatDay, StatDayTone } from '@/stats/describeStatDays';
import { describeStatValue } from '@/stats/describeStatValue';
import type { ColorName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type StatDayRowProperties = {
  statDay: StatDay;
};

const toneColors: Record<StatDayTone, ColorName> = {
  default: 'textPrimary',
  positive: 'successText',
  attention: 'attentionText',
};

const detailToneColors: Record<StatDayTone, ColorName> = {
  default: 'textSecondary',
  positive: 'successText',
  attention: 'attentionText',
};

export function StatDayRow({ statDay }: StatDayRowProperties) {
  const theme = useTheme();
  const { dateLabel, valueText, valueTone, detail, workoutDots } = statDay;
  const accessibilityLabel = [dateLabel, describeStatValue(valueText), detail?.description]
    .filter(Boolean)
    .join(', ');

  return (
    <Box direction="row" align="center" gap="small" accessible accessibilityLabel={accessibilityLabel}>
      <Box style={{ width: theme.sizes.statDayDateColumn }}>
        <Typography variant="caption" color="textSecondary">
          {dateLabel}
        </Typography>
      </Box>
      <Box flex={1}>{workoutDots.length === 0 ? null : <StreakDots days={workoutDots} />}</Box>
      {detail === null ? null : (
        <Typography variant="caption" color={detailToneColors[detail.tone]}>
          {detail.text}
        </Typography>
      )}
      <Typography variant="label" color={toneColors[valueTone]}>
        {valueText}
      </Typography>
    </Box>
  );
}
