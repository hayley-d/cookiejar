import { Alert } from 'react-native';

import { Card } from '@/components/atoms/Card';
import { IconButton } from '@/components/atoms/IconButton';
import { Button } from '@/components/atoms/Button';
import { DurationInput } from '@/components/atoms/DurationInput';
import { TextButton } from '@/components/atoms/TextButton';
import { Stepper } from '@/components/molecules/Stepper';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { TextField } from '@/components/primitives/TextField';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { describeSwimRounds, describeSwimSet } from '@/swimming/describeSwimSet';
import { formatSwimDistance, swimSectionDistance } from '@/swimming/swimDistance';
import type { EditorSwimSection } from '@/swimming/swimEditorReducer';
import { useTheme } from '@/theme/useTheme';

const maximumRounds = 99;

type SwimSectionCardProperties = {
  section: EditorSwimSection;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canAddSet: boolean;
  onChangeName: (name: string) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
  onAddSet: () => void;
  onAddSetToBlock: (blockKey: string) => void;
  onChangeRounds: (blockKey: string, rounds: number) => void;
  onChangeBlockRest: (blockKey: string, restAfterSeconds: number | null) => void;
  onPressSet: (setKey: string) => void;
};

export function SwimSectionCard({
  section,
  canMoveUp,
  canMoveDown,
  canAddSet,
  onChangeName,
  onMove,
  onRemove,
  onAddSet,
  onAddSetToBlock,
  onChangeRounds,
  onChangeBlockRest,
  onPressSet,
}: SwimSectionCardProperties) {
  const theme = useTheme();
  const sectionName = section.name.trim().length === 0 ? 'this section' : section.name.trim();

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
          <IconButton
            icon="chevron.up"
            accessibilityLabel={`Move ${sectionName} up`}
            color="accent"
            disabled={!canMoveUp}
            onPress={() => onMove(-1)}
          />
          <IconButton
            icon="chevron.down"
            accessibilityLabel={`Move ${sectionName} down`}
            color="accent"
            disabled={!canMoveDown}
            onPress={() => onMove(1)}
          />
          <IconButton icon="trash" accessibilityLabel={`Remove ${sectionName}`} color="danger" onPress={confirmRemove} />
        </Box>
        <Typography variant="label" color="textSecondary">
          {formatSwimDistance(swimSectionDistance(section))}
        </Typography>
        {section.blocks.map((block) => {
          const isGroupedBlock = block.rounds > 1 || block.sets.length > 1;
          const roundsText = describeSwimRounds(block.rounds);
          return (
            <Stack key={block.key} gap="small">
              {isGroupedBlock ? (
                <Typography variant="label" color="accent">
                  {roundsText ?? 'Block'}
                </Typography>
              ) : null}
              {block.sets.map((set) => (
                <Touchable
                  key={set.key}
                  onPress={() => onPressSet(set.key)}
                  accessibilityLabel={`Edit set ${describeSwimSet(set)}`}
                  style={{
                    paddingVertical: theme.spacing.small + theme.spacing.extraSmall,
                    paddingHorizontal: theme.spacing.medium,
                    borderRadius: theme.radii.medium,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  }}
                >
                  <Typography>{describeSwimSet(set)}</Typography>
                </Touchable>
              ))}
              {isGroupedBlock ? (
                <DurationInput
                  seconds={block.restAfterSeconds}
                  accessibilityLabel="Rest after block"
                  placeholder="Rest after block, e.g. 1:00"
                  onChangeSeconds={(restAfterSeconds) => onChangeBlockRest(block.key, restAfterSeconds)}
                />
              ) : null}
              <Stepper
                value={block.rounds}
                step={1}
                minimum={1}
                maximum={maximumRounds}
                accessibilityLabel="rounds"
                formatValue={(value) => `${value} ${value === 1 ? 'round' : 'rounds'}`}
                onChangeValue={(rounds) => onChangeRounds(block.key, rounds)}
              />
              <Box direction="row">
                <TextButton
                  label="Add set to block"
                  disabled={!canAddSet}
                  onPress={() => onAddSetToBlock(block.key)}
                />
              </Box>
            </Stack>
          );
        })}
        <Button label="Add set" variant="secondary" onPress={onAddSet} disabled={!canAddSet} />
      </Stack>
    </Card>
  );
}
