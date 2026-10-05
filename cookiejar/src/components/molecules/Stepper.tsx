import { IconButton } from '@/components/atoms/IconButton';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

type StepperProperties = {
  value: number;
  step: number;
  minimum: number;
  maximum: number;
  accessibilityLabel: string;
  formatValue: (value: number) => string;
  onChangeValue: (value: number) => void;
};

export function Stepper({
  value,
  step,
  minimum,
  maximum,
  accessibilityLabel,
  formatValue,
  onChangeValue,
}: StepperProperties) {
  const decreasedValue = Math.max(minimum, value - step);
  const increasedValue = Math.min(maximum, value + step);

  return (
    <Box
      direction="row"
      align="center"
      gap="medium"
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: formatValue(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        onChangeValue(event.nativeEvent.actionName === 'increment' ? increasedValue : decreasedValue);
      }}
    >
      <IconButton
        icon="minus.circle.fill"
        accessibilityLabel={`Decrease ${accessibilityLabel}`}
        color="accent"
        disabled={value <= minimum}
        onPress={() => onChangeValue(decreasedValue)}
      />
      <Typography variant="heading">{formatValue(value)}</Typography>
      <IconButton
        icon="plus.circle.fill"
        accessibilityLabel={`Increase ${accessibilityLabel}`}
        color="accent"
        disabled={value >= maximum}
        onPress={() => onChangeValue(increasedValue)}
      />
    </Box>
  );
}
