import { BottomTabBar, Tabs } from 'expo-router/js-tabs';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { View } from 'react-native';

import { CoachFloatingButton } from '@/components/molecules/CoachFloatingButton';
import { useTheme } from '@/theme/useTheme';

const tabIconSize = 24;
const coachButtonMargin = 16;

export default function TabsLayout() {
  const theme = useTheme();
  const [tabBarHeight, setTabBarHeight] = useState<number | null>(null);

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
      {tabBarHeight === null ? null : (
        <View style={{ position: 'absolute', right: coachButtonMargin, bottom: tabBarHeight + coachButtonMargin }}>
          <CoachFloatingButton />
        </View>
      )}
    </View>
  );
}
