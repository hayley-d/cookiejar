import { Alert } from 'react-native';

import { Card } from '@/components/atoms/Card';
import { IconButton } from '@/components/atoms/IconButton';
import { Button } from '@/components/atoms/Button';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { TextField } from '@/components/primitives/TextField';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { describeSwimBlockRest, describeSwimRounds, describeSwimSet } from '@/swimming/describeSwimSet';
import { formatSwimDistance, swimSectionDistance } from '@/swimming/swimDistance';
import type { EditorSwimSection } from '@/swimming/swimEditorReducer';
import { useTheme } from '@/theme/useTheme';

type SwimSectionCardProperties = {
  section: EditorSwimSection;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canAddSet: boolean;
  onChangeName: (name: string) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
  onAddSet: () => void;
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
          const roundsText = describeSwimRounds(block.rounds);
          const restText = describeSwimBlockRest(block.restAfterSeconds);
          return (
            <Stack key={block.key} gap="small">
              {roundsText === null ? null : (
                <Typography variant="label" color="accent">
                  {roundsText}
                </Typography>
              )}
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
                  {set.notes === null ? null : (
                    <Typography variant="caption" color="textSecondary">
                      {set.notes}
                    </Typography>
                  )}
                </Touchable>
              ))}
              {restText === null ? null : (
                <Typography variant="caption" color="textSecondary">
                  {restText}
                </Typography>
              )}
            </Stack>
          );
        })}
        <Button label="Add set" variant="secondary" onPress={onAddSet} disabled={!canAddSet} />
      </Stack>
    </Card>
  );
}
