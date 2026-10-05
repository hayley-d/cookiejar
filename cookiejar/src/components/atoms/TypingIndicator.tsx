import { Box } from '@/components/primitives/Box';
import { PulseBox } from '@/components/primitives/PulseBox';
import { useTheme } from '@/theme/useTheme';

const dotIndexes = [0, 1, 2];

export function TypingIndicator() {
  const theme = useTheme();
  const dotSize = theme.sizes.typingDot;

  return (
    <Box
      direction="row"
      align="center"
      gap="extraSmall"
      paddingHorizontal="medium"
      paddingVertical="medium"
      background="surface"
      radius="large"
      accessible
      accessibilityRole="text"
      accessibilityLabel="Coach Nuggie is typing"
    >
      {dotIndexes.map((dotIndex) => (
        <PulseBox
          key={dotIndex}
          pulseDuration={theme.durations.typingDotPulse}
          delay={dotIndex * theme.durations.typingDotStagger}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: theme.colors.textSecondary,
          }}
        />
      ))}
    </Box>
  );
}
