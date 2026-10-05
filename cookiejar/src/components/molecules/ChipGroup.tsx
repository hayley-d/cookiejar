import { Chip } from '@/components/atoms/Chip';
import { Stack } from '@/components/primitives/Stack';
import type { NuggieName } from '@/nuggies/NuggieName';

export type ChipOption<Value extends string> = {
  value: Value;
  label: string;
  nuggie?: NuggieName;
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
          nuggie={option.nuggie}
          isSelected={option.value === selectedValue}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </Stack>
  );
}
