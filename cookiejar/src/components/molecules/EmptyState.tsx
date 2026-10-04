import { Button } from '@/components/atoms/Button';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

type EmptyStateProperties = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProperties) {
  return (
    <Box flex={1} align="center" justify="center" gap="medium" padding="large">
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
