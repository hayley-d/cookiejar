import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

export type Segment<Value extends string> = {
  value: Value;
  label: string;
};

type SegmentedControlProperties<Value extends string> = {
  segments: Segment<Value>[];
  selectedValue: Value | null;
  onSelect: (value: Value) => void;
};

const underlineThickness = 3;

export function SegmentedControl<Value extends string>({
  segments,
  selectedValue,
  onSelect,
}: SegmentedControlProperties<Value>) {
  const theme = useTheme();

  return (
    <Box direction="row" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
      {segments.map((segment) => {
        const isSelected = segment.value === selectedValue;
        return (
          <Touchable
            key={segment.value}
            onPress={() => onSelect(segment.value)}
            accessibilityRole="tab"
            accessibilityLabel={segment.label}
            accessibilityState={{ selected: isSelected }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: theme.spacing.small + theme.spacing.extraSmall,
              borderBottomWidth: underlineThickness,
              borderBottomColor: isSelected ? theme.colors.accent : 'transparent',
              marginBottom: -1,
            }}
          >
            <Typography variant="label" color={isSelected ? 'textPrimary' : 'textSecondary'}>
              {segment.label}
            </Typography>
          </Touchable>
        );
      })}
    </Box>
  );
}
