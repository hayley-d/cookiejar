import { useState } from 'react';

import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { SessionSetRow } from '@/components/molecules/SessionSetRow';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Typography } from '@/components/primitives/Typography';
import type { SetCompletionOutcome, SetValues } from '@/sessions/fillSetForTick';
import { useTheme } from '@/theme/useTheme';
import type { SessionExerciseWithSets } from '@/types/SessionWithExercises';
import { targetSetColumns } from '@/workouts/targetSetColumns';

type SessionExerciseCardProperties = {
  sessionExercise: SessionExerciseWithSets;
  onChangeSetValues: (sessionSetId: number, changes: Partial<SetValues>) => void;
  onToggleSetCompletion: (sessionSetId: number) => SetCompletionOutcome;
};

export function SessionExerciseCard({
  sessionExercise,
  onChangeSetValues,
  onToggleSetCompletion,
}: SessionExerciseCardProperties) {
  const theme = useTheme();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const { exercise } = sessionExercise;
  const { imageUrl } = exercise;
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const columns = targetSetColumns(sessionExercise.trackingType);

  return (
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
            <Typography variant="heading">{exercise.name.toUpperCase()}</Typography>
          </Box>
        </Box>
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
              <SessionSetRow
                key={set.id}
                setNumber={index + 1}
                columns={columns}
                set={set}
                onChangeValues={(changes) => onChangeSetValues(set.id, changes)}
                onToggleCompletion={() => onToggleSetCompletion(set.id)}
              />
            ))
          )}
        </Box>
      </Box>
    </Card>
  );
}
