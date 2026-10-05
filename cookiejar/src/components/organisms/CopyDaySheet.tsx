import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import type { Weekday } from '@/plans/weekdays';

type CopyDaySheetProperties = {
  sourceDayName: string;
  targetWeekdays: readonly Weekday[];
  selectedDaysOfWeek: readonly number[];
  onToggleDay: (dayOfWeek: number) => void;
  onCopy: () => void;
  isCopying: boolean;
};

export function CopyDaySheet({
  sourceDayName,
  targetWeekdays,
  selectedDaysOfWeek,
  onToggleDay,
  onCopy,
  isCopying,
}: CopyDaySheetProperties) {
  return (
    <Box padding="large">
      <Stack gap="medium">
        <Stack gap="extraSmall">
          <Typography variant="title">Copy {sourceDayName} to…</Typography>
          <Typography color="textSecondary">
            Workouts are added to the days you choose. A workout already there at the same time is skipped.
          </Typography>
        </Stack>
        <Stack direction="horizontal" gap="small" style={{ flexWrap: 'wrap' }}>
          {targetWeekdays.map((weekday) => (
            <Chip
              key={weekday.dayOfWeek}
              label={weekday.name}
              isSelected={selectedDaysOfWeek.includes(weekday.dayOfWeek)}
              onPress={() => onToggleDay(weekday.dayOfWeek)}
            />
          ))}
        </Stack>
        <Button label="Copy" onPress={onCopy} disabled={isCopying || selectedDaysOfWeek.length === 0} />
      </Stack>
    </Box>
  );
}
