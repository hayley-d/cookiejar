import { ChoiceRow } from '@/components/molecules/ChoiceRow';
import { SettingsRow } from '@/components/molecules/SettingsRow';
import { ToggleRow } from '@/components/molecules/ToggleRow';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { useNotificationPermissionStatus } from '@/hooks/useNotificationPermissionStatus';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { reminderLeadMinuteOptions } from '@/notifications/NotificationSettings';

export default function NotificationSettingsScreen() {
  const { settings, updateSettings } = useNotificationSettings();
  const { permissionStatus, askForPermission, openSystemSettings } = useNotificationPermissionStatus();

  if (settings === null) {
    return <Box flex={1} background="background" />;
  }

  return (
    <Box flex={1} background="background">
      <ScrollBox>
        {permissionStatus === 'denied' ? (
          <SettingsRow
            title="Notifications are off for Nuggie's Gym"
            subtitle="Turn on in Settings"
            onPress={openSystemSettings}
          />
        ) : null}
        {permissionStatus === 'undetermined' ? (
          <SettingsRow
            title="Allow notifications for Nuggie's Gym"
            subtitle="Nuggie needs your OK to send them"
            onPress={() => {
              void askForPermission();
            }}
          />
        ) : null}
        <Box>
          <ToggleRow
            title="Workout reminders"
            value={settings.areWorkoutRemindersEnabled}
            onValueChange={(isEnabled) => {
              void updateSettings({ areWorkoutRemindersEnabled: isEnabled });
            }}
          />
          <ToggleRow
            title="Rest timer alerts"
            value={settings.areRestAlertsEnabled}
            onValueChange={(isEnabled) => {
              void updateSettings({ areRestAlertsEnabled: isEnabled });
            }}
          />
          <ToggleRow
            title="Sunday summary"
            value={settings.isWeeklySummaryEnabled}
            onValueChange={(isEnabled) => {
              void updateSettings({ isWeeklySummaryEnabled: isEnabled });
            }}
          />
        </Box>
        {settings.areWorkoutRemindersEnabled ? (
          <Box>
            <Typography variant="caption" color="textSecondary">
              Remind me
            </Typography>
            {reminderLeadMinuteOptions.map((leadMinutes) => (
              <ChoiceRow
                key={leadMinutes}
                title={`${leadMinutes} minutes before`}
                isSelected={settings.reminderLeadMinutes === leadMinutes}
                onPress={() => {
                  void updateSettings({ reminderLeadMinutes: leadMinutes });
                }}
              />
            ))}
          </Box>
        ) : null}
      </ScrollBox>
    </Box>
  );
}
