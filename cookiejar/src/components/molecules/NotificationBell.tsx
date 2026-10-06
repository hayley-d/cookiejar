import { UnreadDot } from '@/components/atoms/UnreadDot';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import { useTheme } from '@/theme/useTheme';

type NotificationBellProperties = {
  unreadCount: number;
  onPress: () => void;
};

function describeBell(unreadCount: number): string {
  if (unreadCount === 0) {
    return 'Notifications';
  }
  return unreadCount === 1 ? 'Notifications, 1 unread' : `Notifications, ${unreadCount} unread`;
}

export function NotificationBell({ unreadCount, onPress }: NotificationBellProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={describeBell(unreadCount)}
      style={{
        width: theme.sizes.minimumTouchTarget,
        height: theme.sizes.minimumTouchTarget,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="bell" size={theme.sizes.bellIcon} weight="semibold" />
      {unreadCount > 0 ? (
        <Box
          style={{
            position: 'absolute',
            top: theme.sizes.bellUnreadDotInset,
            right: theme.sizes.bellUnreadDotInset,
          }}
        >
          <UnreadDot />
        </Box>
      ) : null}
    </Touchable>
  );
}
