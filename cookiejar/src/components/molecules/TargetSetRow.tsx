import { DurationInput } from '@/components/atoms/DurationInput';
import { NumberInput } from '@/components/atoms/NumberInput';
import { Box } from '@/components/primitives/Box';
import { SwipeableBox } from '@/components/primitives/SwipeableBox';
import { Typography } from '@/components/primitives/Typography';
import {
  columnInputValue,
  targetSetChangeFromInput,
  type TargetSetColumn,
  type TargetSetValues,
} from '@/workouts/targetSetColumns';

type TargetSetRowProperties = {
  setNumber: number;
  columns: TargetSetColumn[];
  targetSet: TargetSetValues;
  onChangeTargetSet: (changes: Partial<TargetSetValues>) => void;
  onRemove: () => void;
};

export const setNumberColumnWidth = 40;

export function TargetSetRow({ setNumber, columns, targetSet, onChangeTargetSet, onRemove }: TargetSetRowProperties) {
  return (
    <SwipeableBox actionLabel="Remove" onSwipeLeft={onRemove}>
      <Box direction="row" align="center" gap="small" paddingVertical="extraSmall" background="surface">
        <Box style={{ width: setNumberColumnWidth }}>
          <Typography variant="label" align="center">
            {setNumber}
          </Typography>
        </Box>
        {columns.map((column) => {
          const accessibilityLabel = `Set ${setNumber} ${column.label}`;
          return (
            <Box key={column.field} flex={1}>
              {column.input === 'duration' ? (
                <DurationInput
                  seconds={targetSet.durationSeconds}
                  placeholder={column.placeholder}
                  accessibilityLabel={accessibilityLabel}
                  onChangeSeconds={(seconds) => onChangeTargetSet(targetSetChangeFromInput(column, seconds))}
                />
              ) : (
                <NumberInput
                  value={columnInputValue(column, targetSet)}
                  decimalPlaces={column.decimalPlaces}
                  placeholder={column.placeholder}
                  accessibilityLabel={accessibilityLabel}
                  onChangeValue={(value) => onChangeTargetSet(targetSetChangeFromInput(column, value))}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </SwipeableBox>
  );
}
