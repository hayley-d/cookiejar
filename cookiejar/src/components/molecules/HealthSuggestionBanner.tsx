import { Card } from "@/components/atoms/Card";
import { Icon } from "@/components/primitives/Icon";
import { Stack } from "@/components/primitives/Stack";
import { Touchable } from "@/components/primitives/Touchable";
import { Typography } from "@/components/primitives/Typography";
import { useTheme } from "@/theme/useTheme";

type HealthSuggestionBannerProperties = {
  activityName: string;
  durationLabel: string;
  isLinking: boolean;
  onLink: () => void;
};

export function HealthSuggestionBanner({
  activityName,
  durationLabel,
  isLinking,
  onLink,
}: HealthSuggestionBannerProperties) {
  const theme = useTheme();
  const message = `Link Garmin ${activityName} (${durationLabel})?`;

  return (
    <Touchable
      onPress={onLink}
      disabled={isLinking}
      accessibilityLabel={message}
    >
      <Card>
        <Stack
          direction="horizontal"
          gap="medium"
          align="center"
          justify="space-between"
        >
          <Typography variant="label" style={{ flex: 1 }}>
            {message}
          </Typography>
          <Icon
            name="chevron.right"
            size={theme.sizes.planRowChevron}
            color="textSecondary"
            weight="semibold"
          />
        </Stack>
      </Card>
    </Touchable>
  );
}
