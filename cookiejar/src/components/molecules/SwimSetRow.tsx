import type { ReactNode } from 'react';
import { ActionSheetIOS } from 'react-native';

import { DurationInput } from '@/components/atoms/DurationInput';
import { MenuField } from '@/components/atoms/MenuField';
import { NumberInput } from '@/components/atoms/NumberInput';
import { Box } from '@/components/primitives/Box';
import { SwipeableBox } from '@/components/primitives/SwipeableBox';
import { Switch } from '@/components/primitives/Switch';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import type { EditorSwimSet, SwimSetChanges, SwimStroke } from '@/swimming/swimEditorReducer';
import { toggleSwimEquipment } from '@/swimming/toggleSwimEquipment';
import { swimEquipmentLabels, swimEquipmentList } from '@/types/SwimEquipment';

type SwimSetRowProperties = {
  set: EditorSwimSet;
  setNumber: number;
  strokes: SwimStroke[];
  dragHandle: ReactNode;
  onChangeSet: (changes: SwimSetChanges) => void;
  onRemove: () => void;
};

const maximumRepetitions = 99;
const defaultSendOffSeconds = 90;
const strokeColumnFlex = 2;
const gearColumnFlex = 1.6;

const columns = [
  { label: 'REPS', flex: 1 },
  { label: 'DISTANCE', flex: 1.2 },
  { label: 'STROKE', flex: strokeColumnFlex },
  { label: 'GEAR', flex: gearColumnFlex },
];

function describeEquipment(set: EditorSwimSet) {
  return set.equipment.length === 0
    ? 'None'
    : set.equipment.map((equipment) => swimEquipmentLabels[equipment]).join(', ');
}

export function SwimSetRow({ set, setNumber, strokes, dragHandle, onChangeSet, onRemove }: SwimSetRowProperties) {
  const isSendOff = set.restMode === 'send_off';
  const accessibilityPrefix = `Set ${setNumber}`;

  const openStrokeMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Stroke',
        options: [...strokes.map((stroke) => stroke.name), 'Cancel'],
        cancelButtonIndex: strokes.length,
      },
      (optionIndex) => {
        const stroke = strokes[optionIndex];
        if (stroke !== undefined) {
          onChangeSet({ exerciseId: stroke.id, exerciseName: stroke.name });
        }
      },
    );
  };

  const openEquipmentMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Equipment',
        options: [
          ...swimEquipmentList.map((equipment) =>
            set.equipment.includes(equipment) ? `✓ ${swimEquipmentLabels[equipment]}` : swimEquipmentLabels[equipment],
          ),
          'Done',
        ],
        cancelButtonIndex: swimEquipmentList.length,
      },
      (optionIndex) => {
        const equipment = swimEquipmentList[optionIndex];
        if (equipment !== undefined) {
          onChangeSet({ equipment: toggleSwimEquipment(set.equipment, equipment) });
        }
      },
    );
  };

  const changeSendOff = (shouldSendOff: boolean) => {
    onChangeSet(
      shouldSendOff
        ? { restMode: 'send_off', sendOffSeconds: set.sendOffSeconds ?? defaultSendOffSeconds }
        : { restMode: 'fixed' },
    );
  };

  return (
    <SwipeableBox actionLabel="Remove" onSwipeLeft={onRemove}>
      <Box gap="small" background="surface">
        {dragHandle}
        <Box direction="row" gap="small">
          {columns.map((column) => (
            <Box key={column.label} style={{ flex: column.flex }}>
              <Typography variant="caption" color="textSecondary" align="center">
                {column.label}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box direction="row" gap="small" align="center">
          <Box style={{ flex: columns[0].flex }}>
            <NumberInput
              value={set.repetitions}
              decimalPlaces={0}
              accessibilityLabel={`${accessibilityPrefix} repetitions`}
              onChangeValue={(repetitions) => {
                if (repetitions !== null && repetitions >= 1) {
                  onChangeSet({ repetitions: Math.min(repetitions, maximumRepetitions) });
                }
              }}
            />
          </Box>
          <Box style={{ flex: columns[1].flex }}>
            <NumberInput
              value={set.distanceMeters}
              decimalPlaces={0}
              accessibilityLabel={`${accessibilityPrefix} distance in metres`}
              onChangeValue={(distanceMeters) => {
                if (distanceMeters !== null && distanceMeters > 0) {
                  onChangeSet({ distanceMeters });
                }
              }}
            />
          </Box>
          <Box style={{ flex: strokeColumnFlex }}>
            <MenuField
              value={set.exerciseName}
              accessibilityLabel={`${accessibilityPrefix} stroke`}
              onPress={openStrokeMenu}
            />
          </Box>
          <Box style={{ flex: gearColumnFlex }}>
            <MenuField
              value={describeEquipment(set)}
              accessibilityLabel={`${accessibilityPrefix} equipment`}
              onPress={openEquipmentMenu}
            />
          </Box>
        </Box>
        <Box direction="row" gap="small" align="center">
          <Typography variant="caption" color="textSecondary">
            {isSendOff ? 'EVERY' : 'REST'}
          </Typography>
          <Box flex={1}>
            {isSendOff ? (
              <DurationInput
                seconds={set.sendOffSeconds}
                accessibilityLabel={`${accessibilityPrefix} send-off interval`}
                placeholder="e.g. 1:45"
                onChangeSeconds={(sendOffSeconds) => {
                  if (sendOffSeconds !== null && sendOffSeconds > 0) {
                    onChangeSet({ sendOffSeconds });
                  }
                }}
              />
            ) : (
              <DurationInput
                seconds={set.restSeconds}
                accessibilityLabel={`${accessibilityPrefix} rest after each rep`}
                placeholder="None, e.g. 0:20"
                onChangeSeconds={(restSeconds) => onChangeSet({ restSeconds })}
              />
            )}
          </Box>
          <Typography variant="caption" color="textSecondary">
            Send-off
          </Typography>
          <Switch
            value={isSendOff}
            onValueChange={changeSendOff}
            accessibilityLabel={`${accessibilityPrefix} send-off`}
          />
        </Box>
        <TextField
          value={set.notes ?? ''}
          onChangeText={(notes) => onChangeSet({ notes: notes.length === 0 ? null : notes })}
          placeholder="Note, e.g. easy"
          accessibilityLabel={`${accessibilityPrefix} note`}
        />
      </Box>
    </SwipeableBox>
  );
}
