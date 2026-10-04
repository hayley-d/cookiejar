import { Button } from '@/components/atoms/Button';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';

type EmptyStateProperties = {
  title: string;
  message: string;
  nuggie?: NuggieName;
  actionLabel?: string;
  onAction?: () => void;
};

const nuggieSize = 140;

export function EmptyState({ title, message, nuggie, actionLabel, onAction }: EmptyStateProperties) {
  return (
    <Box flex={1} align="center" justify="center" gap="medium" padding="large">
      {nuggie ? <NuggieImage name={nuggie} size={nuggieSize} /> : null}
      <Box align="center" gap="small">
        <Typography variant="title" align="center">
          {title}
        </Typography>
        <Typography color="textSecondary" align="center">
          {message}
        </Typography>
      </Box>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </Box>
  );
}
