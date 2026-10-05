import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type UserMessageBubbleProperties = {
  text: string;
};

export function UserMessageBubble({ text }: UserMessageBubbleProperties) {
  const theme = useTheme();

  return (
    <Box direction="row" justify="flex-end">
      <Box
        padding="medium"
        background="accent"
        radius="large"
        style={{ flexShrink: 1, maxWidth: theme.sizes.chatBubbleMaximumWidth }}
      >
        <Typography color="onAccent">{text}</Typography>
      </Box>
    </Box>
  );
}
