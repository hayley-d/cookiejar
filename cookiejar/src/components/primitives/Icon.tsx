import { SymbolView, type SFSymbol, type SymbolWeight } from 'expo-symbols';

import type { ColorName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type IconProperties = {
  name: SFSymbol;
  size: number;
  color?: ColorName;
  weight?: SymbolWeight;
};

export function Icon({ name, size, color = 'textPrimary', weight }: IconProperties) {
  const theme = useTheme();

  return <SymbolView name={name} size={size} tintColor={theme.colors[color]} weight={weight} />;
}
