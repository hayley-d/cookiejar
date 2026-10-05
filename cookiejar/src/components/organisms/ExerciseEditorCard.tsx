import { useState } from 'react';
import { ActionSheetIOS, Alert } from 'react-native';

import { Card } from '@/components/atoms/Card';
import { IconButton } from '@/components/atoms/IconButton';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { SupersetBracket } from '@/components/atoms/SupersetBracket';
import { TextButton } from '@/components/atoms/TextButton';
import { TargetSetTable } from '@/components/molecules/TargetSetTable';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import { trackingTypeLabels, trackingTypes, type TrackingType } from '@/types/TrackingType';
import { trackingTypeChangeClearsValues, type TargetSetValues } from '@/workouts/targetSetColumns';
import { formatRestSeconds, restPresetOptions, restSecondsForPresetIndex } from '@/workouts/restPresets';
import type { SupersetCardPosition } from '@/workouts/supersetCardPositions';
import type { EditorItem } from '@/workouts/workoutEditorReducer';

type ExerciseEditorCardProperties = {
  item: EditorItem;
  supersetPosition: SupersetCardPosition;
  onChangeTrackingType: (trackingType: TrackingType) => void;
  onChangeTargetSet: (targetSetKey: string, changes: Partial<TargetSetValues>) => void;
  onAddTargetSet: () => void;
  onRemoveTargetSet: (targetSetKey: string) => void;
  onChangeRest: (restSeconds: number | null) => void;
  onReplace: () => void;
  onRemove: () => void;
  onCreateSuperset: () => void;
  onRemoveSuperset: () => void;
  onShowSupersetInfo: () => void;
};

const imageSize = 56;
const menuOptions = ['Tracking type', 'Rest time', 'Replace exercise', 'Remove', 'Cancel'];
const trackingTypeMenuIndex = 0;
const restMenuIndex = 1;
const replaceMenuIndex = 2;
const removeMenuIndex = 3;
const restMenuOptions = [...restPresetOptions, 'Cancel'];
const trackingTypeMenuOptions = [...trackingTypes.map((trackingType) => trackingTypeLabels[trackingType]), 'Cancel'];

export function ExerciseEditorCard({
  item,
  supersetPosition,
  onChangeTrackingType,
  onChangeTargetSet,
  onAddTargetSet,
  onRemoveTargetSet,
  onChangeRest,
  onReplace,
  onRemove,
  onCreateSuperset,
  onRemoveSuperset,
  onShowSupersetInfo,
}: ExerciseEditorCardProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const { exercise } = item;
  const { imageUrl } = exercise;
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const { label, bracket, isLinkedToNext, isLastItem } = supersetPosition;

  const chooseTrackingType = (trackingType: TrackingType) => {
    if (trackingType === item.trackingType) {
      return;
    }
    if (!trackingTypeChangeClearsValues(item.targetSets, trackingType)) {
      onChangeTrackingType(trackingType);
      return;
    }
    const trackingTypeLabel = trackingTypeLabels[trackingType];
    Alert.alert(
      `Change to ${trackingTypeLabel}?`,
      `Set values that ${trackingTypeLabel} doesn't use will be cleared.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change', style: 'destructive', onPress: () => onChangeTrackingType(trackingType) },
      ],
    );
  };

  const openTrackingTypeMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      { title: 'Tracking type', options: trackingTypeMenuOptions, cancelButtonIndex: trackingTypes.length },
      (optionIndex) => {
        const trackingType = trackingTypes[optionIndex];
        if (trackingType) {
          chooseTrackingType(trackingType);
        }
      },
    );
  };

  const openRestMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      { title: 'Rest time', options: restMenuOptions, cancelButtonIndex: restPresetOptions.length },
      (optionIndex) => {
        const restSeconds = restSecondsForPresetIndex(optionIndex);
        if (restSeconds !== undefined) {
          onChangeRest(restSeconds);
        }
      },
    );
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
        if (optionIndex === trackingTypeMenuIndex) {
          openTrackingTypeMenu();
        } else if (optionIndex === restMenuIndex) {
          openRestMenu();
        } else if (optionIndex === replaceMenuIndex) {
          onReplace();
        } else if (optionIndex === removeMenuIndex) {
          onRemove();
        }
      },
    );
  };

  return (
    <Box style={bracket === null ? undefined : { paddingLeft: theme.spacing.medium }}>
      {bracket === null ? null : <SupersetBracket position={bracket} />}
      <Stack gap="small">
        <Card>
          <Stack gap="medium">
            <Stack direction="horizontal" gap="medium" align="center">
              {showsImage ? (
                <Image
                  source={{ uri: imageUrl }}
                  contentFit="cover"
                  style={{ width: imageSize, height: imageSize, borderRadius: theme.radii.medium }}
                  onError={() => setFailedImageUrl(imageUrl)}
                />
              ) : (
                <NuggieImage name="workout" size={imageSize} shape="rounded" />
              )}
              <Box flex={1}>
                <Typography variant="heading">
                  {label === null ? exercise.name.toUpperCase() : `${label}  ${exercise.name.toUpperCase()}`}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {item.restSeconds === null
                    ? trackingTypeLabels[item.trackingType]
                    : `${trackingTypeLabels[item.trackingType]} · Rest ${formatRestSeconds(item.restSeconds)}`}
                </Typography>
              </Box>
              <IconButton icon="ellipsis" accessibilityLabel={`More options for ${exercise.name}`} onPress={openMenu} />
            </Stack>
            <TargetSetTable
              trackingType={item.trackingType}
              targetSets={item.targetSets}
              onChangeTargetSet={onChangeTargetSet}
              onAddTargetSet={onAddTargetSet}
              onRemoveTargetSet={onRemoveTargetSet}
            />
          </Stack>
        </Card>
        <Stack direction="horizontal" gap="small" align="center" justify="center">
          {isLinkedToNext ? (
            <TextButton label="Unlink" onPress={onRemoveSuperset} />
          ) : isLastItem ? null : (
            <TextButton label="Create superset" onPress={onCreateSuperset} />
          )}
          <IconButton icon="info.circle" accessibilityLabel="About supersets" onPress={onShowSupersetInfo} />
        </Stack>
      </Stack>
    </Box>
  );
}
