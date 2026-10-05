import { useCallback } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { GreetingHeader } from '@/components/molecules/GreetingHeader';
import { HealthPermissionCard } from '@/components/molecules/HealthPermissionCard';
import { StatTile } from '@/components/molecules/StatTile';
import { TodayCarousel } from '@/components/organisms/TodayCarousel';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';
import { formatSteps } from '@/health/formatSteps';
import { shouldShowHealthAccessHint } from '@/health/shouldShowHealthAccessHint';
import { useDailyHealth } from '@/hooks/useDailyHealth';
import { useHealthAuthorization } from '@/hooks/useHealthAuthorization';
import { useProfile } from '@/hooks/useProfile';
import { useScheduledWorkoutsForDate } from '@/hooks/useScheduledWorkouts';
import { useStartSession } from '@/hooks/useStartSession';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

const coachButtonClearance = 96;
const healthAccessInstructions = 'Settings → Health → Data Access & Devices → Cookiejar → Turn On All';

const showHealthAccessInstructions = () => {
  Alert.alert('Connect Apple Health', healthAccessInstructions);
};

export default function HomeScreen() {
  const now = new Date();
  const today = toLocalDateString(now);
  const { displayName } = useProfile();
  const { hasRequestedAuthorization, isRequesting, requestAuthorization } = useHealthAuthorization();
  const { snapshot, refresh } = useDailyHealth(today);
  const todayWorkouts = useScheduledWorkoutsForDate(today);
  const { startSession } = useStartSession();

  const startScheduledWorkout = useCallback(
    (scheduledWorkout: ScheduledWorkout) => {
      const workoutId = scheduledWorkout.workout.id;
      if (workoutId === null) {
        return;
      }
      void startSession({ workoutId, date: scheduledWorkout.date, planEntryId: scheduledWorkout.planEntryId });
    },
    [startSession],
  );

  const connectHealth = async () => {
    await requestAuthorization();
    refresh();
  };

  const shouldShowHint = shouldShowHealthAccessHint(hasRequestedAuthorization, snapshot);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScrollBox showsVerticalScrollIndicator={false}>
          <GreetingHeader displayName={displayName} now={now} />
          {todayWorkouts.status === 'ready' ? (
            <TodayCarousel scheduledWorkouts={todayWorkouts.scheduledWorkouts} onStartWorkout={startScheduledWorkout} />
          ) : null}
          {hasRequestedAuthorization === false ? (
            <HealthPermissionCard onConnect={connectHealth} isConnecting={isRequesting} />
          ) : null}
          {hasRequestedAuthorization === true ? (
            <Box direction="row" gap="small">
              <StatTile value={formatSteps(snapshot?.steps ?? null)} label="Steps" />
              <StatTile value={formatSleepMinutes(snapshot?.sleepMinutes ?? null)} label="Sleep" />
              <StatTile value={formatRestingHeartRate(snapshot?.restingHeartRate ?? null)} label="Resting HR" />
            </Box>
          ) : null}
          {shouldShowHint ? (
            <EmptyState
              nuggie="tired"
              title="No data yet — check Health access"
              message="A new watch that has not synced looks the same as no access."
              actionLabel="Connect Apple Health"
              onAction={showHealthAccessInstructions}
            />
          ) : null}
        </ScrollBox>
      </Box>
    </SafeAreaView>
  );
}
