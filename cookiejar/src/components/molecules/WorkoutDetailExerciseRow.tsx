import { useState } from 'react';

import { Card } from '@/components/atoms/Card';
import { Icon } from '@/components/primitives/Icon';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { SupersetBracket } from '@/components/atoms/SupersetBracket';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import type { TargetSet } from '@/types/TargetSet';
import type { TrackingType } from '@/types/TrackingType';
import { describeTargetSets, formatTargetSetValue } from '@/workouts/describeTargetSets';
import type { SupersetBracketPosition } from '@/workouts/supersetCardPositions';
import { targetSetColumns } from '@/workouts/targetSetColumns';

type WorkoutDetailExerciseRowProperties = {
  name: string;
  imageUrl: string | null;
  label: string | null;
  bracket: SupersetBracketPosition | null;
  trackingType: TrackingType;
  targetSets: TargetSet[];
};

export function WorkoutDetailExerciseRow({
  name,
  imageUrl,
  label,
  bracket,
  trackingType,
  targetSets,
}: WorkoutDetailExerciseRowProperties) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const summary = describeTargetSets(trackingType, targetSets);
  const columns = targetSetColumns(trackingType);
  const canExpand = targetSets.length > 0;
  const accessibilityName = label === null ? name : `${label}, ${name}`;

  return (
    <Box style={{ paddingLeft: bracket === null ? 0 : theme.spacing.medium }}>
      {bracket === null ? null : <SupersetBracket position={bracket} />}
      <Card padding="small">
        <Touchable
          onPress={() => setIsExpanded((wasExpanded) => !wasExpanded)}
          disabled={!canExpand}
          accessibilityLabel={`${accessibilityName}, ${summary}`}
          accessibilityState={{ expanded: isExpanded }}
          accessibilityHint={canExpand ? 'Shows or hides the set targets' : undefined}
        >
          <Box direction="row" gap="medium" align="center">
            {label === null ? null : (
              <Typography variant="label" color="accent">
                {label}
              </Typography>
            )}
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
            <Box flex={1} gap="extraSmall">
              <Typography variant="label">{name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {summary}
              </Typography>
            </Box>
            {canExpand ? (
              <Icon name={isExpanded ? 'chevron.up' : 'chevron.down'} size={theme.sizes.planRowChevron} color="textSecondary" />
            ) : null}
          </Box>
        </Touchable>
        {isExpanded ? (
          <Box gap="small" style={{ marginTop: theme.spacing.medium }}>
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
              <Box key={targetSet.id} direction="row" gap="small">
                <Box style={{ width: theme.sizes.setNumberColumn }}>
                  <Typography align="center" color="textSecondary">
                    {index + 1}
                  </Typography>
                </Box>
                {columns.map((column) => (
                  <Box key={column.field} flex={1}>
                    <Typography align="center">{formatTargetSetValue(column.field, targetSet)}</Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ) : null}
      </Card>
    </Box>
  );
}
