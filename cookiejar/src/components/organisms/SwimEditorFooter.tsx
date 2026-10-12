import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type SwimEditorFooterProperties = {
  totalText: string;
  canSave: boolean;
  onSave: () => void;
};

export function SwimEditorFooter({ totalText, canSave, onSave }: SwimEditorFooterProperties) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Box
      direction="row"
      gap="medium"
      align="center"
      paddingHorizontal="medium"
      background="background"
      style={{ paddingTop: theme.spacing.small, paddingBottom: theme.spacing.small + safeAreaInsets.bottom }}
    >
      <Box flex={1}>
        <Typography variant="heading">{totalText}</Typography>
      </Box>
      <Box flex={1}>
        <Button label="Save workout" onPress={onSave} disabled={!canSave} />
      </Box>
    </Box>
  );
}
