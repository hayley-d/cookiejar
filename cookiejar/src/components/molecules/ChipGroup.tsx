import { Chip } from '@/components/atoms/Chip';
import { Stack } from '@/components/primitives/Stack';

export type ChipOption<Value extends string> = {
  value: Value;
  label: string;
};

type ChipGroupProperties<Value extends string> = {
  options: ChipOption<Value>[];
  selectedValue: Value | null;
  onSelect: (value: Value) => void;
};

export function ChipGroup<Value extends string>({ options, selectedValue, onSelect }: ChipGroupProperties<Value>) {
  return (
    <Stack direction="horizontal" gap="small" style={{ flexWrap: 'wrap' }}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          isSelected={option.value === selectedValue}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </Stack>
  );
}
