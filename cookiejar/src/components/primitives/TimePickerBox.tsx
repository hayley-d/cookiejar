import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/theme/useTheme';

type TimePickerBoxMode = 'time' | 'date';

type TimePickerBoxDisplay = 'compact' | 'inline' | 'spinner';

type TimePickerBoxProperties = {
  value: Date;
  onChangeValue: (value: Date) => void;
  accessibilityLabel: string;
  mode?: TimePickerBoxMode;
  display?: TimePickerBoxDisplay;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function TimePickerBox({
  value,
  onChangeValue,
  accessibilityLabel,
  mode = 'time',
  display = 'compact',
  minimumDate,
  maximumDate,
}: TimePickerBoxProperties) {
  const theme = useTheme();

  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={display}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      accentColor={theme.colors.accent}
      textColor={theme.colors.textPrimary}
      themeVariant={theme.colorScheme}
      accessibilityLabel={accessibilityLabel}
      onValueChange={(_event, selectedValue) => onChangeValue(selectedValue)}
    />
  );
}
