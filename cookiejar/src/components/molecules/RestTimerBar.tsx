import { IconButton } from '@/components/atoms/IconButton';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { formatRestCountdown } from '@/sessions/formatSessionValues';
import { useTheme } from '@/theme/useTheme';

type RestTimerBarProperties = {
  remainingSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
};

export function RestTimerBar({ remainingSeconds, isPaused, onTogglePause }: RestTimerBarProperties) {
  const theme = useTheme();
  const remainingText = formatRestCountdown(remainingSeconds);

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      paddingHorizontal="medium"
      paddingVertical="extraSmall"
      background="accentSoft"
    >
      <NuggieImage name="tired" size={theme.sizes.restBarNuggie} />
      <Box flex={1}>
        <Typography
          variant="label"
          accessibilityRole="timer"
          accessibilityLabel={`Rest ${remainingText}${isPaused ? ', paused' : ''}`}
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {`Rest ${remainingText}`}
        </Typography>
      </Box>
      <IconButton
        icon={isPaused ? 'play.fill' : 'pause.fill'}
        accessibilityLabel={isPaused ? 'Resume rest' : 'Pause rest'}
        onPress={onTogglePause}
        color="accent"
      />
    </Box>
  );
}
