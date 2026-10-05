import { TextButton } from '@/components/atoms/TextButton';
import { Box } from '@/components/primitives/Box';
import { TimePickerBox } from '@/components/primitives/TimePickerBox';
import { Typography } from '@/components/primitives/Typography';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';

type DatePickerFieldProperties = {
  value: string | null;
  accessibilityLabel: string;
  onChangeValue: (value: string | null) => void;
  maximumDate?: Date;
};

export function DatePickerField({ value, accessibilityLabel, onChangeValue, maximumDate }: DatePickerFieldProperties) {
  if (value === null) {
    return (
      <Box direction="row" align="center" justify="space-between">
        <Typography color="textSecondary">Not set</Typography>
        <TextButton
          label="Set date"
          accessibilityLabel={`Set ${accessibilityLabel}`}
          onPress={() => onChangeValue(toLocalDateString(maximumDate ?? new Date()))}
        />
      </Box>
    );
  }

  return (
    <Box direction="row" align="center" justify="space-between">
      <TimePickerBox
        mode="date"
        value={parseLocalDateString(value)}
        maximumDate={maximumDate}
        accessibilityLabel={accessibilityLabel}
        onChangeValue={(selectedDate) => onChangeValue(toLocalDateString(selectedDate))}
      />
      <TextButton
        label="Clear"
        accessibilityLabel={`Clear ${accessibilityLabel}`}
        onPress={() => onChangeValue(null)}
      />
    </Box>
  );
}
