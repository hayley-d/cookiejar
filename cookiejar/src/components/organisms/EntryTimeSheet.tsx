import { Button } from '@/components/atoms/Button';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { TimePickerBox } from '@/components/primitives/TimePickerBox';
import { Typography } from '@/components/primitives/Typography';
import { dateToTimeOfDay, timeOfDayToDate } from '@/plans/timeOfDay';

type EntryTimeSheetProperties = {
  workoutName: string;
  dayName: string;
  timeOfDay: string;
  onChangeTimeOfDay: (timeOfDay: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function EntryTimeSheet({
  workoutName,
  dayName,
  timeOfDay,
  onChangeTimeOfDay,
  onSave,
  isSaving,
}: EntryTimeSheetProperties) {
  return (
    <Box padding="large">
      <Stack gap="medium">
        <Stack gap="extraSmall">
          <Typography variant="title">Change time</Typography>
          <Typography color="textSecondary">
            {workoutName} on {dayName}
          </Typography>
        </Stack>
        <Stack direction="horizontal" align="center" justify="center">
          <TimePickerBox
            value={timeOfDayToDate(timeOfDay, new Date())}
            onChangeValue={(value) => onChangeTimeOfDay(dateToTimeOfDay(value))}
            accessibilityLabel="Time"
            display="spinner"
          />
        </Stack>
        <Button label="Save" onPress={onSave} disabled={isSaving} />
      </Stack>
    </Box>
  );
}
