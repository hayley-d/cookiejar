import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { Box } from '@/components/primitives/Box';
import { useTheme } from '@/theme/useTheme';

type WorkoutEditorFooterProperties = {
  canSave: boolean;
  onAddExercises: () => void;
  onSave: () => void;
};

export function WorkoutEditorFooter({ canSave, onAddExercises, onSave }: WorkoutEditorFooterProperties) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Box
      direction="row"
      gap="small"
      paddingHorizontal="medium"
      background="background"
      style={{ paddingTop: theme.spacing.small, paddingBottom: theme.spacing.small + safeAreaInsets.bottom }}
    >
      <Box flex={1}>
        <Button label="Add exercises" variant="secondary" onPress={onAddExercises} />
      </Box>
      <Box flex={1}>
        <Button label="Save workout" onPress={onSave} disabled={!canSave} />
      </Box>
    </Box>
  );
}
