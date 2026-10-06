import { NuggieImage } from "@/components/atoms/NuggieImage";
import { UnreadDot } from "@/components/atoms/UnreadDot";
import { Box } from "@/components/primitives/Box";
import { Touchable } from "@/components/primitives/Touchable";
import { Typography } from "@/components/primitives/Typography";
import { formatRelativeTime } from "@/dates/formatRelativeTime";
import { useTheme } from "@/theme/useTheme";
import type { AppNotification } from "@/types/AppNotification";

type NotificationRowProperties = {
  notification: AppNotification;
  now: Date;
  onPress: (notification: AppNotification) => void;
};

const unreadFontWeight = "800";
const readFontWeight = "400";

export function NotificationRow({
  notification,
  now,
  onPress,
}: NotificationRowProperties) {
  const theme = useTheme();
  const isUnread = notification.readAt === null;
  const relativeTime = formatRelativeTime(notification.createdAt, now);

  return (
    <Touchable
      onPress={() => onPress(notification)}
      accessibilityLabel={`${isUnread ? "Unread. " : ""}${notification.title}. ${notification.body}. ${relativeTime}`}
    >
      <Box
        direction="row"
        align="center"
        gap="medium"
        paddingVertical="medium"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <NuggieImage
          name={notification.nuggie}
          size={theme.sizes.notificationRowNuggie}
        />
        <Box flex={1} gap="extraSmall">
          <Typography
            variant="label"
            style={{ fontWeight: isUnread ? unreadFontWeight : readFontWeight }}
          >
            {notification.title}
          </Typography>
          <Typography
            style={{ fontWeight: isUnread ? unreadFontWeight : readFontWeight }}
          >
            {notification.body}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {relativeTime}
          </Typography>
        </Box>
        {isUnread ? <UnreadDot /> : null}
      </Box>
    </Touchable>
  );
}
