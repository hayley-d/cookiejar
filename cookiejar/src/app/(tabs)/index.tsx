import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { GreetingHeader } from '@/components/molecules/GreetingHeader';
import { NoPlanCard } from '@/components/molecules/NoPlanCard';
import { NotificationBell } from '@/components/molecules/NotificationBell';
import { RestDayCard } from '@/components/molecules/RestDayCard';
import { WeeklyStreakTile } from '@/components/molecules/WeeklyStreakTile';
import { StatTileGrid } from '@/components/organisms/StatTileGrid';
import { TodayCarousel } from '@/components/organisms/TodayCarousel';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { addDays } from '@/dates/addDays';
import { datesBetween } from '@/dates/datesBetween';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { compareToAverage } from '@/health/compareToAverage';
import { shouldShowHealthAccessHint } from '@/health/shouldShowHealthAccessHint';
import { useDailyHealth } from '@/hooks/useDailyHealth';
import { useHealthAuthorization } from '@/hooks/useHealthAuthorization';
import { useHealthRange } from '@/hooks/useHealthRange';
import { useNotificationPermissionSheet } from '@/hooks/useNotificationPermissionSheet';
import { useProfile } from '@/hooks/useProfile';
import { useScheduledWorkoutsForDate } from '@/hooks/useScheduledWorkouts';
import { useStartSession } from '@/hooks/useStartSession';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import { useWeeklyStreak } from '@/hooks/useWeeklyStreak';
import type { StatsMetric } from '@/stats/parseStatsMetric';
import { useTheme } from '@/theme/useTheme';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

const trendDayCount = 7;
const healthAccessInstructions = "Settings → Health → Data Access & Devices → Nuggie's Gym → Turn On All";

const showHealthAccessInstructions = () => {
  Alert.alert('Connect Apple Health', healthAccessInstructions);
};

export default function HomeScreen() {
  const theme = useTheme();
  useNotificationPermissionSheet();
  const now = new Date();
  const today = toLocalDateString(now);
  const { displayName, dailyStepGoal, weeklyWorkoutTarget } = useProfile();
  const { hasRequestedAuthorization, isRequesting, requestAuthorization } = useHealthAuthorization();
  const { snapshot, refresh } = useDailyHealth(today);
  const previousDays = datesBetween(
    toLocalDateString(addDays(now, -trendDayCount)),
    toLocalDateString(addDays(now, -1)),
  );
  const { snapshotsByDate } = useHealthRange(previousDays[0], previousDays[previousDays.length - 1]);
  const restingHeartRateTrend = compareToAverage(
    snapshot?.restingHeartRate ?? null,
    previousDays.map((date) => snapshotsByDate.get(date)?.restingHeartRate ?? null),
  );
  const todayWorkouts = useScheduledWorkoutsForDate(today);
  const { startSession } = useStartSession();
  const weeklyStreak = useWeeklyStreak(now, weeklyWorkoutTarget);
  const unreadNotificationCount = useUnreadNotificationCount();

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

  const navigateToCreate = () => {
    router.navigate('/create');
  };

  const openMetric = (metric: StatsMetric) => {
    router.navigate({ pathname: '/stats/[metric]', params: { metric } });
  };

  const openNotifications = () => {
    router.push('/notifications');
  };

  const navigateToPlanNew = () => {
    router.navigate('/plans/new');
  };

  const shouldShowHint = shouldShowHealthAccessHint(hasRequestedAuthorization, snapshot);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background">
        <ScrollBox showsVerticalScrollIndicator={false} contentBottomPadding={theme.sizes.coachButtonClearance}>
          <GreetingHeader
            displayName={displayName}
            now={now}
            accessory={<NotificationBell unreadCount={unreadNotificationCount} onPress={openNotifications} />}
          />
          {todayWorkouts.status === 'ready' ? (
            todayWorkouts.scheduledWorkouts.length > 0 ? (
              <TodayCarousel
                scheduledWorkouts={todayWorkouts.scheduledWorkouts}
                onStartWorkout={startScheduledWorkout}
              />
            ) : todayWorkouts.hasActivePlan ? (
              <RestDayCard onPickWorkout={navigateToCreate} />
            ) : (
              <NoPlanCard onCreatePlan={navigateToPlanNew} />
            )
          ) : null}
          <StatTileGrid
            hasRequestedAuthorization={hasRequestedAuthorization}
            isConnecting={isRequesting}
            onConnect={connectHealth}
            steps={snapshot?.steps ?? null}
            sleepMinutes={snapshot?.sleepMinutes ?? null}
            restingHeartRate={snapshot?.restingHeartRate ?? null}
            restingHeartRateTrend={restingHeartRateTrend}
            dailyStepGoal={dailyStepGoal}
            now={now}
            onOpenMetric={openMetric}
            weeklyTile={
              <WeeklyStreakTile
                streak={weeklyStreak.status === 'ready' ? weeklyStreak.streak : null}
                isTargetMet={weeklyStreak.status === 'ready' && weeklyStreak.isTargetMet}
                now={now}
                onPress={() => openMetric('streak')}
              />
            }
          />
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
