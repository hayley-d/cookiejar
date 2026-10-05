import { Button } from '@/components/atoms/Button';
import { TargetSetRow } from '@/components/molecules/TargetSetRow';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import type { TrackingType } from '@/types/TrackingType';
import { targetSetColumns, type TargetSetValues } from '@/workouts/targetSetColumns';
import type { EditorTargetSet } from '@/workouts/workoutEditorReducer';

type TargetSetTableProperties = {
  trackingType: TrackingType;
  targetSets: EditorTargetSet[];
  onChangeTargetSet: (targetSetKey: string, changes: Partial<TargetSetValues>) => void;
  onAddTargetSet: () => void;
  onRemoveTargetSet: (targetSetKey: string) => void;
};

export function TargetSetTable({
  trackingType,
  targetSets,
  onChangeTargetSet,
  onAddTargetSet,
  onRemoveTargetSet,
}: TargetSetTableProperties) {
  const theme = useTheme();
  const columns = targetSetColumns(trackingType);

  return (
    <Box gap="small">
      <Box direction="row" gap="small">
        <Box style={{ width: theme.sizes.setNumberColumn }}>
          <Typography variant="caption" color="textSecondary" align="center">
            SET
          </Typography>
        </Box>
        {columns.map((column) => (
          <Box key={column.field} flex={1}>
            <Typography variant="caption" color="textSecondary" align="center">
              {column.label.toUpperCase()}
            </Typography>
          </Box>
        ))}
      </Box>
      {targetSets.map((targetSet, index) => (
        <TargetSetRow
          key={targetSet.key}
          setNumber={index + 1}
          columns={columns}
          targetSet={targetSet}
          onChangeTargetSet={(changes) => onChangeTargetSet(targetSet.key, changes)}
          onRemove={() => onRemoveTargetSet(targetSet.key)}
        />
      ))}
      <Box align="center">
        <Button label="Add set" variant="secondary" onPress={onAddTargetSet} />
      </Box>
    </Box>
  );
}
