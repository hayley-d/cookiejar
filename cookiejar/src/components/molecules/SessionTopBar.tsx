import type { ReactNode } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type SessionTopBarProperties = {
  title: string;
  topInset: number;
  isQuitDisabled: boolean;
  onQuit: () => void;
  trailing?: ReactNode;
};

export function SessionTopBar({ title, topInset, isQuitDisabled, onQuit, trailing }: SessionTopBarProperties) {
  const theme = useTheme();

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      paddingHorizontal="medium"
      style={{ paddingTop: topInset + theme.spacing.small, paddingBottom: theme.spacing.small }}
    >
      <Box align="flex-start" style={{ width: theme.sizes.sessionTopBarSideSlot }}>
        <TextButton
          label="✕ Quit"
          color="danger"
          accessibilityLabel="Quit workout"
          onPress={onQuit}
          disabled={isQuitDisabled}
        />
      </Box>
      <Box flex={1}>
        <Typography variant="heading" align="center" numberOfLines={1} accessibilityRole="header">
          {title}
        </Typography>
      </Box>
      <Box align="flex-end" style={{ width: theme.sizes.sessionTopBarSideSlot }}>
        {trailing}
      </Box>
    </Box>
  );
}
