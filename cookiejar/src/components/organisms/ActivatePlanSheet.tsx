import { Button } from '@/components/atoms/Button';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { TimePickerBox } from '@/components/primitives/TimePickerBox';
import { Typography } from '@/components/primitives/Typography';

type ActivatePlanSheetProperties = {
  planName: string;
  startDate: Date;
  onChangeStartDate: (startDate: Date) => void;
  onConfirm: () => void;
  isSaving: boolean;
};

export function ActivatePlanSheet({
  planName,
  startDate,
  onChangeStartDate,
  onConfirm,
  isSaving,
}: ActivatePlanSheetProperties) {
  return (
    <Box padding="large">
      <Stack gap="medium">
        <Stack gap="extraSmall">
          <Typography variant="title">Make active</Typography>
          <Typography color="textSecondary">Choose the day {planName} starts.</Typography>
        </Stack>
        <Stack direction="horizontal" align="center" justify="center">
          <TimePickerBox
            value={startDate}
            onChangeValue={onChangeStartDate}
            accessibilityLabel="Start date"
            mode="date"
            display="inline"
          />
        </Stack>
        <Button label="Make active" onPress={onConfirm} disabled={isSaving} />
      </Stack>
    </Box>
  );
}
