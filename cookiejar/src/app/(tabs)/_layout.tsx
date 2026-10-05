import { router, useSegments } from 'expo-router';
import { BottomTabBar, Tabs } from 'expo-router/js-tabs';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { ActiveSessionBanner } from '@/components/molecules/ActiveSessionBanner';
import { CoachFloatingButton } from '@/components/molecules/CoachFloatingButton';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useTipOfTheDay } from '@/hooks/useTipOfTheDay';
import { useTheme } from '@/theme/useTheme';

const tabIconSize = 24;
const coachButtonMargin = 16;
const resumeSettleMilliseconds = 1000;
const tabsWithBanner = ['index', 'calendar'];

function useFocusedTabName(): string | null {
  const segments: string[] = useSegments();
  if (segments[0] !== '(tabs)') {
    return null;
  }
  return segments[1] ?? 'index';
}

export default function TabsLayout() {
  const theme = useTheme();
  const [tabBarHeight, setTabBarHeight] = useState<number | null>(null);
  const activeSessionLookup = useActiveSession();
  const focusedTabName = useFocusedTabName();
  const tipText = useTipOfTheDay();
  const isResuming = useRef(false);

  const resumeActiveSession = useCallback(() => {
    if (isResuming.current || activeSessionLookup.status !== 'active') {
      return;
    }
    isResuming.current = true;
    setTimeout(() => {
      isResuming.current = false;
    }, resumeSettleMilliseconds);
    router.push({
      pathname: '/sessions/[sessionId]',
      params: { sessionId: String(activeSessionLookup.activeSession.id) },
    });
  }, [activeSessionLookup]);

  const isBannerVisible =
    activeSessionLookup.status === 'active' && focusedTabName !== null && tabsWithBanner.includes(focusedTabName);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(tabBarProperties) => (
          <View onLayout={(event) => setTabBarHeight(event.nativeEvent.layout.height)}>
            <BottomTabBar {...tabBarProperties} />
          </View>
        )}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.colors.background },
          tabBarStyle: { backgroundColor: theme.colors.tabBar },
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.textSecondary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <SymbolView name="house.fill" tintColor={color} size={tabIconSize} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => <SymbolView name="calendar" tintColor={color} size={tabIconSize} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color }) => <SymbolView name="plus.circle.fill" tintColor={color} size={tabIconSize} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <SymbolView name="person.crop.circle" tintColor={color} size={tabIconSize} />,
          }}
        />
      </Tabs>
      {tabBarHeight === null || !isBannerVisible || activeSessionLookup.status !== 'active' ? null : (
        <View
          style={{
            position: 'absolute',
            left: coachButtonMargin,
            right: coachButtonMargin + theme.sizes.coachButton + theme.spacing.small,
            bottom: tabBarHeight + coachButtonMargin,
          }}
        >
          <ActiveSessionBanner startedAt={activeSessionLookup.activeSession.startedAt} onPress={resumeActiveSession} />
        </View>
      )}
      {tabBarHeight === null ? null : (
        <View style={{ position: 'absolute', right: coachButtonMargin, bottom: tabBarHeight + coachButtonMargin }}>
          <CoachFloatingButton tipText={tipText} />
        </View>
      )}
    </View>
  );
}
