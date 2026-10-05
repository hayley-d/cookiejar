import type { SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';

import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';
import type { ColorName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type StatTileTone = 'default' | 'positive' | 'attention';

type StatTileProperties = {
  value: string;
  label: string;
  icon?: SFSymbol;
  caption?: string;
  accessory?: ReactNode;
  tone?: StatTileTone;
  nuggie?: NuggieName;
  onPress?: () => void;
  accessibilityHint?: string;
  accessibilityDetail?: string;
};

const toneColors: Record<StatTileTone, { text: ColorName; background: ColorName }> = {
  default: { text: 'textPrimary', background: 'surface' },
  positive: { text: 'successText', background: 'successSoft' },
  attention: { text: 'attentionText', background: 'attentionSoft' },
};

export function StatTile({
  value,
  label,
  icon,
  caption,
  accessory,
  tone = 'default',
  nuggie,
  onPress,
  accessibilityHint,
  accessibilityDetail,
}: StatTileProperties) {
  const theme = useTheme();
  const colors = toneColors[tone];
  const isDetailed = icon !== undefined || caption !== undefined || accessory !== undefined || nuggie !== undefined;
  const accessibilityLabel = [`${label} ${value}`, caption, accessibilityDetail]
    .filter((part) => part !== undefined)
    .join(', ');

  if (!isDetailed) {
    return (
      <Card
        padding="small"
        accessible
        accessibilityLabel={accessibilityLabel}
        style={{
          flex: 1,
          minHeight: theme.sizes.statTileMinimumHeight,
          justifyContent: 'center',
        }}
      >
        <Typography variant="heading" align="center">
          {value}
        </Typography>
        <Typography variant="caption" color="textSecondary" align="center">
          {label}
        </Typography>
      </Card>
    );
  }

  const detailedTile = (
    <Card
      padding="small"
      accessible={onPress === undefined}
      accessibilityLabel={onPress === undefined ? accessibilityLabel : undefined}
      style={{
        flex: 1,
        minHeight: theme.sizes.statTileMinimumHeight,
        justifyContent: 'space-between',
        backgroundColor: theme.colors[colors.background],
      }}
    >
      <Box direction="row" align="center" justify="space-between" gap="small">
        <Box direction="row" align="center" gap="extraSmall" flex={1}>
          {icon === undefined ? null : (
            <Icon name={icon} size={theme.sizes.statTileIcon} color="textSecondary" weight="semibold" />
          )}
          <Typography variant="caption" color="textSecondary">
            {label}
          </Typography>
        </Box>
        {nuggie === undefined ? null : <NuggieImage name={nuggie} size={theme.sizes.statTileNuggie} />}
      </Box>
      <Typography variant="heading" color={colors.text}>
        {value}
      </Typography>
      <Box direction="row" align="center" gap="extraSmall">
        {accessory}
        {caption === undefined ? null : (
          <Typography variant="caption" color="textSecondary" style={{ flexShrink: 1 }}>
            {caption}
          </Typography>
        )}
      </Box>
    </Card>
  );

  if (onPress === undefined) {
    return detailedTile;
  }

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={{ flex: 1 }}
    >
      {detailedTile}
    </Touchable>
  );
}
