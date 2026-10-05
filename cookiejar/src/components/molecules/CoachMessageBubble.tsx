import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/Button';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';
import { useTheme } from '@/theme/useTheme';

type CoachMessageBubbleProperties = {
  nuggie: NuggieName;
  text?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children?: ReactNode;
};

export function CoachMessageBubble({
  nuggie,
  text,
  actionLabel,
  onActionPress,
  children,
}: CoachMessageBubbleProperties) {
  const theme = useTheme();

  return (
    <Box direction="row" align="flex-end" gap="small">
      <NuggieImage name={nuggie} size={theme.sizes.coachAvatar} />
      {children ?? (
        <Box
          gap="small"
          padding="medium"
          background="surface"
          radius="large"
          style={{ flexShrink: 1, maxWidth: theme.sizes.chatBubbleMaximumWidth }}
        >
          <Typography>{text}</Typography>
          {actionLabel && onActionPress ? (
            <Button label={actionLabel} variant="secondary" onPress={onActionPress} />
          ) : null}
        </Box>
      )}
    </Box>
  );
}
