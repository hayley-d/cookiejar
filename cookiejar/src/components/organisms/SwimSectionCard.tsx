import type { ReactNode } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { DurationInput } from '@/components/atoms/DurationInput';
import { IconButton } from '@/components/atoms/IconButton';
import { NumberInput } from '@/components/atoms/NumberInput';
import { TextButton } from '@/components/atoms/TextButton';
import { SwimSetRow } from '@/components/molecules/SwimSetRow';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import { describeSwimRounds } from '@/swimming/describeSwimSet';
import { formatSwimDistance, swimSectionDistance } from '@/swimming/swimDistance';
import type { EditorSwimSection, SwimSetChanges, SwimStroke } from '@/swimming/swimEditorReducer';
import { useTheme } from '@/theme/useTheme';

const maximumRounds = 99;

type SwimSectionCardProperties = {
  section: EditorSwimSection;
  strokes: SwimStroke[];
  canAddSet: boolean;
  dragHandle: ReactNode;
  renderBlockDragHandle: (blockIndex: number) => ReactNode;
  onChangeName: (name: string) => void;
  onRemove: () => void;
  onAddSet: () => void;
  onAddSetToBlock: (blockKey: string) => void;
  onChangeRounds: (blockKey: string, rounds: number) => void;
  onChangeBlockRest: (blockKey: string, restAfterSeconds: number | null) => void;
  onChangeSet: (setKey: string, changes: SwimSetChanges) => void;
  onRemoveSet: (setKey: string) => void;
};

export function SwimSectionCard({
  section,
  strokes,
  canAddSet,
  dragHandle,
  renderBlockDragHandle,
  onChangeName,
  onRemove,
  onAddSet,
  onAddSetToBlock,
  onChangeRounds,
  onChangeBlockRest,
  onChangeSet,
  onRemoveSet,
}: SwimSectionCardProperties) {
  const theme = useTheme();
  const sectionName = section.name.trim().length === 0 ? 'this section' : section.name.trim();
  const firstSetNumbers = section.blocks.reduce<number[]>(
    (setNumbers, block, blockIndex) => [
      ...setNumbers,
      blockIndex === 0 ? 1 : setNumbers[blockIndex - 1] + section.blocks[blockIndex - 1].sets.length,
    ],
    [],
  );

  const confirmRemove = () => {
    if (section.blocks.length === 0) {
      onRemove();
      return;
    }
    Alert.alert(`Remove ${sectionName}?`, 'Its sets will be removed too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  };

  return (
    <Card>
      {dragHandle}
      <Stack gap="medium">
        <Box direction="row" align="center" gap="small">
          <Box flex={1}>
            <TextField
              value={section.name}
              onChangeText={onChangeName}
              placeholder="Section name"
              autoCapitalize="words"
              returnKeyType="done"
              accessibilityLabel="Section name"
            />
          </Box>
          <IconButton icon="trash" accessibilityLabel={`Remove ${sectionName}`} color="danger" onPress={confirmRemove} />
        </Box>
        <Typography variant="label" color="textSecondary">
          {formatSwimDistance(swimSectionDistance(section))}
        </Typography>
        {section.blocks.map((block, blockIndex) => {
          const isGroupedBlock = block.rounds > 1 || block.sets.length > 1;
          const blockDragHandle = renderBlockDragHandle(blockIndex);
          return (
            <Box
              key={block.key}
              gap="small"
              style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.medium }}
            >
              {isGroupedBlock ? (
                <>
                  {blockDragHandle}
                  <Typography variant="label" color="accent">
                    {describeSwimRounds(block.rounds) ?? 'Block'}
                  </Typography>
                </>
              ) : null}
              {block.sets.map((set, setIndex) => (
                <SwimSetRow
                  key={set.key}
                  set={set}
                  setNumber={firstSetNumbers[blockIndex] + setIndex}
                  strokes={strokes}
                  dragHandle={isGroupedBlock ? null : blockDragHandle}
                  onChangeSet={(changes) => onChangeSet(set.key, changes)}
                  onRemove={() => onRemoveSet(set.key)}
                />
              ))}
              <Box direction="row" align="center" gap="small">
                <Typography variant="caption" color="textSecondary">
                  ROUNDS
                </Typography>
                <Box style={{ width: theme.sizes.swimRoundsInput }}>
                  <NumberInput
                    value={block.rounds}
                    decimalPlaces={0}
                    accessibilityLabel="Rounds"
                    onChangeValue={(rounds) => {
                      if (rounds !== null && rounds >= 1) {
                        onChangeRounds(block.key, Math.min(rounds, maximumRounds));
                      }
                    }}
                  />
                </Box>
                {isGroupedBlock ? (
                  <Box flex={1}>
                    <DurationInput
                      seconds={block.restAfterSeconds}
                      accessibilityLabel="Rest after block"
                      placeholder="Rest after, e.g. 1:00"
                      onChangeSeconds={(restAfterSeconds) => onChangeBlockRest(block.key, restAfterSeconds)}
                    />
                  </Box>
                ) : (
                  <Box flex={1} />
                )}
              </Box>
              <Box direction="row">
                <TextButton
                  label="Add set to block"
                  disabled={!canAddSet}
                  onPress={() => onAddSetToBlock(block.key)}
                />
              </Box>
            </Box>
          );
        })}
        <Button label="Add set" variant="secondary" onPress={onAddSet} disabled={!canAddSet} />
      </Stack>
    </Card>
  );
}
