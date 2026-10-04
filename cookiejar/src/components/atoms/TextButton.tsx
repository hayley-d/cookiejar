import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';

type TextButtonColor = 'accent' | 'danger';

type TextButtonProperties = {
  label: string;
  onPress: () => void;
  color?: TextButtonColor;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function TextButton({ label, onPress, color = 'accent', accessibilityLabel, disabled }: TextButtonProperties) {
  return (
    <Touchable onPress={onPress} disabled={disabled} accessibilityLabel={accessibilityLabel ?? label}>
      <Typography variant="label" color={color}>
        {label}
      </Typography>
    </Touchable>
  );
}
