import type { SFSymbol } from 'expo-symbols';

import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import type { ColorName } from '@/theme/tokens';

type IconButtonProperties = {
  icon: SFSymbol;
  accessibilityLabel: string;
  onPress: () => void;
  color?: ColorName;
  disabled?: boolean;
};

const hitAreaSize = 44;
const iconSize = 22;

export function IconButton({ icon, accessibilityLabel, onPress, color = 'textPrimary', disabled }: IconButtonProperties) {
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={{ width: hitAreaSize, height: hitAreaSize, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={icon} size={iconSize} color={color} weight="semibold" />
    </Touchable>
  );
}
