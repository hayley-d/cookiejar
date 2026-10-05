import * as Haptics from 'expo-haptics';
import { useState } from 'react';

import { Checkbox } from '@/components/atoms/Checkbox';
import { CountdownButton } from '@/components/atoms/CountdownButton';
import { DurationInput } from '@/components/atoms/DurationInput';
import { NumberInput } from '@/components/atoms/NumberInput';
import { Box } from '@/components/primitives/Box';
import { ShakeBox } from '@/components/primitives/ShakeBox';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { formatDuration } from '@/dates/formatDuration';
import { formatNumberText } from '@/numbers/numberText';
import { actualValuesOf, targetValuesOf, type SetCompletionOutcome, type SetValues } from '@/sessions/fillSetForTick';
import { useTheme } from '@/theme/useTheme';
import type { SessionSet } from '@/types/SessionSet';
import { columnInputValue, targetSetChangeFromInput, type TargetSetColumn } from '@/workouts/targetSetColumns';

type SessionSetRowProperties = {
  setNumber: number;
  previousText: string;
  columns: TargetSetColumn[];
  set: SessionSet;
  onChangeValues: (changes: Partial<SetValues>) => void;
  onToggleCompletion: () => SetCompletionOutcome;
};

function targetPlaceholder(column: TargetSetColumn, targetValues: SetValues): string {
  const targetValue = columnInputValue(column, targetValues);
  if (targetValue === null) {
    return column.placeholder;
  }
  return column.input === 'duration' ? formatDuration(targetValue) : formatNumberText(targetValue);
}

export function SessionSetRow({
  setNumber,
  previousText,
  columns,
  set,
  onChangeValues,
  onToggleCompletion,
}: SessionSetRowProperties) {
  const theme = useTheme();
  const [shakeCount, setShakeCount] = useState(0);
  const isCompleted = set.completedAt !== null;
  const actualValues = actualValuesOf(set);
  const targetValues = targetValuesOf(set);

  const finishCountdown = (elapsedSeconds: number) => {
    if (elapsedSeconds > 0) {
      onChangeValues({ durationSeconds: elapsedSeconds });
    }
  };

  const acceptPlaceholder = (column: TargetSetColumn) => {
    if (actualValues[column.field] === null && targetValues[column.field] !== null) {
      onChangeValues({ [column.field]: targetValues[column.field] });
    }
  };

  const toggleCompletion = () => {
    const outcome = onToggleCompletion();
    if (outcome === 'ticked') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (outcome === 'refused') {
      setShakeCount((previousShakeCount) => previousShakeCount + 1);
    }
  };

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      paddingVertical="extraSmall"
      radius="small"
      background={isCompleted ? 'successSoft' : 'surface'}
    >
      <Box style={{ width: theme.sizes.setNumberColumn }}>
        <Typography variant="label" align="center">
          {setNumber}
        </Typography>
      </Box>
      <Box style={{ width: theme.sizes.previousColumn }}>
        <Typography variant="caption" color="textSecondary" align="center" numberOfLines={1}>
          {previousText}
        </Typography>
      </Box>
      <ShakeBox shakeCount={shakeCount} style={{ flex: 1, flexDirection: 'row', gap: theme.spacing.small }}>
        {columns.map((column) => {
          const accessibilityLabel = `Set ${setNumber} ${column.label}`;
          const placeholder = targetPlaceholder(column, targetValues);
          return (
            <Box key={column.field} flex={1}>
              {column.input === 'duration' ? (
                <Box direction="row" align="center" gap="small">
                  <Box flex={1}>
                    <DurationInput
                      seconds={actualValues.durationSeconds}
                      placeholder={placeholder}
                      accessibilityLabel={accessibilityLabel}
                      onFocus={() => acceptPlaceholder(column)}
                      onChangeSeconds={(seconds) => onChangeValues(targetSetChangeFromInput(column, seconds))}
                    />
                  </Box>
                  <CountdownButton
                    targetSeconds={targetValues.durationSeconds}
                    accessibilityLabel={`timer for set ${setNumber}`}
                    onFinish={finishCountdown}
                  />
                </Box>
              ) : (
                <NumberInput
                  value={columnInputValue(column, actualValues)}
                  decimalPlaces={column.decimalPlaces}
                  placeholder={placeholder}
                  accessibilityLabel={accessibilityLabel}
                  onFocus={() => acceptPlaceholder(column)}
                  onChangeValue={(value) => onChangeValues(targetSetChangeFromInput(column, value))}
                />
              )}
            </Box>
          );
        })}
      </ShakeBox>
      <Touchable
        onPress={toggleCompletion}
        accessibilityRole="checkbox"
        accessibilityLabel={`Complete set ${setNumber}`}
        accessibilityState={{ checked: isCompleted }}
        style={{ width: theme.sizes.setCompletionColumn, alignItems: 'center', justifyContent: 'center' }}
      >
        <Checkbox isChecked={isCompleted} />
      </Touchable>
    </Box>
  );
}
