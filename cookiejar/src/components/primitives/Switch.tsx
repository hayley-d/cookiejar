import { Switch as NativeSwitch } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type SwitchProperties = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

export function Switch({ value, onValueChange, accessibilityLabel, disabled }: SwitchProperties) {
  const theme = useTheme();

  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
      thumbColor={theme.colors.surface}
      ios_backgroundColor={theme.colors.border}
    />
  );
}
