import { useState } from 'react';
import { ActionSheetIOS, Alert } from 'react-native';

import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { IconButton } from '@/components/atoms/IconButton';
import { SupersetBracket } from '@/components/atoms/SupersetBracket';
import { TextButton } from '@/components/atoms/TextButton';
import { SessionSetRow } from '@/components/molecules/SessionSetRow';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { SwipeableBox } from '@/components/primitives/SwipeableBox';
import { Typography } from '@/components/primitives/Typography';
import { describePreviousSet, matchPreviousSets, type PreviousSessionSet } from '@/sessions/describePreviousSet';
import type { SetCompletionOutcome, SetValues } from '@/sessions/fillSetForTick';
import { useTheme } from '@/theme/useTheme';
import type { SessionExerciseWithSets } from '@/types/SessionWithExercises';
import type { SupersetBracketPosition } from '@/workouts/supersetCardPositions';
import { formatRestSeconds, restPresetOptions, restSecondsForPresetIndex } from '@/workouts/restPresets';
import { targetSetColumns } from '@/workouts/targetSetColumns';

type SessionExerciseCardProperties = {
  sessionExercise: SessionExerciseWithSets;
  label: string | null;
  bracket: SupersetBracketPosition | null;
  previousSets: PreviousSessionSet[];
  onChangeSetValues: (sessionSetId: number, changes: Partial<SetValues>) => void;
  onToggleSetCompletion: (sessionSetId: number) => SetCompletionOutcome;
  onAddSet: () => void;
  onRemoveSet: (sessionSetId: number) => void;
  onChangeRest: (restSeconds: number | null) => void;
  onReplace: () => void;
  onRemove: () => void;
};

const menuOptions = ['Rest time', 'Replace exercise', 'Remove exercise', 'Cancel'];
const restMenuIndex = 0;
const replaceMenuIndex = 1;
const removeMenuIndex = 2;
const restMenuOptions = [...restPresetOptions, 'Cancel'];

export function SessionExerciseCard({
  sessionExercise,
  label,
  bracket,
  previousSets,
  onChangeSetValues,
  onToggleSetCompletion,
  onAddSet,
  onRemoveSet,
  onChangeRest,
  onReplace,
  onRemove,
}: SessionExerciseCardProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const { exercise } = sessionExercise;
  const { imageUrl } = exercise;
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const columns = targetSetColumns(sessionExercise.trackingType);
  const matchedPreviousSets = matchPreviousSets(sessionExercise.sets, previousSets);

  const openRestMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Rest time',
        options: restMenuOptions,
        cancelButtonIndex: restPresetOptions.length,
      },
      (optionIndex) => {
        const restSeconds = restSecondsForPresetIndex(optionIndex);
        if (restSeconds !== undefined) {
          onChangeRest(restSeconds);
        }
      },
    );
  };

  const confirmRemove = () => {
    Alert.alert(`Remove ${exercise.name}?`, 'Its sets will be removed from this workout.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  };

  const openMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: exercise.name,
        options: menuOptions,
        destructiveButtonIndex: removeMenuIndex,
        cancelButtonIndex: menuOptions.length - 1,
      },
      (optionIndex) => {
        if (optionIndex === restMenuIndex) {
          openRestMenu();
        } else if (optionIndex === replaceMenuIndex) {
          onReplace();
        } else if (optionIndex === removeMenuIndex) {
          confirmRemove();
        }
      },
    );
  };

  return (
    <Box style={bracket === null ? undefined : { paddingLeft: theme.spacing.medium }}>
      {bracket === null ? null : <SupersetBracket position={bracket} />}
      <Card>
        <Box gap="medium">
          <Box direction="row" gap="medium" align="center">
            {showsImage ? (
              <Image
                source={{ uri: imageUrl }}
                contentFit="cover"
                style={{
                  width: theme.sizes.exerciseEditorImage,
                  height: theme.sizes.exerciseEditorImage,
                  borderRadius: theme.radii.medium,
                }}
                onError={() => setFailedImageUrl(imageUrl)}
              />
            ) : (
              <NuggieImage name="workout" size={theme.sizes.exerciseEditorImage} shape="rounded" />
            )}
            <Box flex={1}>
              <Typography variant="heading">
                {label === null ? exercise.name.toUpperCase() : `${label}  ${exercise.name.toUpperCase()}`}
              </Typography>
              {sessionExercise.replacedExerciseName === null ? null : (
                <Typography variant="caption" color="textSecondary">
                  Replaced {sessionExercise.replacedExerciseName}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary">
                {sessionExercise.restSeconds === null
                  ? 'No rest'
                  : `Rest ${formatRestSeconds(sessionExercise.restSeconds)}`}
              </Typography>
            </Box>
            <IconButton icon="ellipsis" accessibilityLabel={`More options for ${exercise.name}`} onPress={openMenu} />
          </Box>
          <Box gap="small">
            <Box direction="row" gap="small">
              <Box style={{ width: theme.sizes.setNumberColumn }}>
                <Typography variant="caption" color="textSecondary" align="center">
                  SET
                </Typography>
              </Box>
              <Box style={{ width: theme.sizes.previousColumn }}>
                <Typography variant="caption" color="textSecondary" align="center">
                  PREVIOUS
                </Typography>
              </Box>
              {columns.map((column) => (
                <Box key={column.field} flex={1}>
                  <Typography variant="caption" color="textSecondary" align="center">
                    {column.label.toUpperCase()}
                  </Typography>
                </Box>
              ))}
              <Box style={{ width: theme.sizes.setCompletionColumn }}>
                <Typography variant="caption" color="textSecondary" align="center">
                  ✓
                </Typography>
              </Box>
            </Box>
            {sessionExercise.sets.length === 0 ? (
              <Typography variant="caption" color="textSecondary">
                No sets
              </Typography>
            ) : (
              sessionExercise.sets.map((set, index) => (
                <SwipeableBox key={set.id} actionLabel="Remove" onSwipeLeft={() => onRemoveSet(set.id)}>
                  <SessionSetRow
                    setNumber={index + 1}
                    previousText={describePreviousSet(sessionExercise.trackingType, matchedPreviousSets[index] ?? null)}
                    columns={columns}
                    set={set}
                    onChangeValues={(changes) => onChangeSetValues(set.id, changes)}
                    onToggleCompletion={() => onToggleSetCompletion(set.id)}
                  />
                </SwipeableBox>
              ))
            )}
            <Box align="center">
              <TextButton label="+ ADD SET" onPress={onAddSet} />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
