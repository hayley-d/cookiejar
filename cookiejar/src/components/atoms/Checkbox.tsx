import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { useTheme } from '@/theme/useTheme';

type CheckboxProperties = {
  isChecked: boolean;
};

const checkboxSize = 28;
const tickSize = 14;
const borderThickness = 2;

export function Checkbox({ isChecked }: CheckboxProperties) {
  const theme = useTheme();

  return (
    <Box
      align="center"
      justify="center"
      style={{
        width: checkboxSize,
        height: checkboxSize,
        borderRadius: checkboxSize / 2,
        borderWidth: borderThickness,
        borderColor: isChecked ? theme.colors.accent : theme.colors.border,
        backgroundColor: isChecked ? theme.colors.accent : theme.colors.surface,
      }}
    >
      {isChecked ? <Icon name="checkmark" size={tickSize} color="onAccent" weight="bold" /> : null}
    </Box>
  );
}
