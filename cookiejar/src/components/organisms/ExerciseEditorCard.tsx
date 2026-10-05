import { useState } from 'react';
import { ActionSheetIOS, Alert } from 'react-native';

import { Card } from '@/components/atoms/Card';
import { IconButton } from '@/components/atoms/IconButton';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { TargetSetTable } from '@/components/molecules/TargetSetTable';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import { trackingTypeLabels, trackingTypes, type TrackingType } from '@/types/TrackingType';
import { trackingTypeChangeClearsValues, type TargetSetValues } from '@/workouts/targetSetColumns';
import type { EditorItem } from '@/workouts/workoutEditorReducer';

type ExerciseEditorCardProperties = {
  item: EditorItem;
  onChangeTrackingType: (trackingType: TrackingType) => void;
  onChangeTargetSet: (targetSetKey: string, changes: Partial<TargetSetValues>) => void;
  onAddTargetSet: () => void;
  onRemoveTargetSet: (targetSetKey: string) => void;
};

const imageSize = 56;
const menuOptions = ['Tracking type', 'Cancel'];
const trackingTypeMenuOptions = [...trackingTypes.map((trackingType) => trackingTypeLabels[trackingType]), 'Cancel'];

export function ExerciseEditorCard({
  item,
  onChangeTrackingType,
  onChangeTargetSet,
  onAddTargetSet,
  onRemoveTargetSet,
}: ExerciseEditorCardProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const { exercise } = item;
  const { imageUrl } = exercise;
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;

  const chooseTrackingType = (trackingType: TrackingType) => {
    if (trackingType === item.trackingType) {
      return;
    }
    if (!trackingTypeChangeClearsValues(item.targetSets, trackingType)) {
      onChangeTrackingType(trackingType);
      return;
    }
    const trackingTypeLabel = trackingTypeLabels[trackingType];
    Alert.alert(`Change to ${trackingTypeLabel}?`, `Set values that ${trackingTypeLabel} doesn't use will be cleared.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Change', style: 'destructive', onPress: () => onChangeTrackingType(trackingType) },
    ]);
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

  const openMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      { title: exercise.name, options: menuOptions, cancelButtonIndex: menuOptions.length - 1 },
      (optionIndex) => {
        if (optionIndex === 0) {
          openTrackingTypeMenu();
        }
      },
    );
  };

  return (
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
            <Typography variant="heading">{exercise.name.toUpperCase()}</Typography>
            <Typography variant="caption" color="textSecondary">
              {trackingTypeLabels[item.trackingType]}
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
  );
}
