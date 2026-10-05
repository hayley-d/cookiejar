import { useCallback, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { WeekStrip, type WeekStripHandle } from '@/components/organisms/WeekStrip';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { formatFullDate } from '@/dates/formatFullDate';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { monthLabelForWeek } from '@/dates/weekPages';
import { useSelectedDate } from '@/hooks/useSelectedDate';
import { useWeekPages } from '@/hooks/useWeekPages';
import { useTheme } from '@/theme/useTheme';

export default function CalendarScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  const todayDate = toLocalDateString(today);
  const {
    weekStarts,
    initialWeekIndex,
    currentWeekIndex,
    currentWeekStart,
    visibleWeekStart,
    showWeek,
    prependWeeks,
    appendWeeks,
  } = useWeekPages(today);
  const { selectedDate, selectDate, followVisibleWeek } = useSelectedDate(todayDate);
  const weekStripReference = useRef<WeekStripHandle>(null);

  const changeVisibleWeek = useCallback(
    (weekStart: string) => {
      showWeek(weekStart);
      followVisibleWeek(weekStart);
    },
    [showWeek, followVisibleWeek],
  );

  const returnToToday = useCallback(() => {
    showWeek(currentWeekStart);
    selectDate(todayDate);
    weekStripReference.current?.scrollToWeekIndex(currentWeekIndex);
  }, [showWeek, selectDate, currentWeekStart, todayDate, currentWeekIndex]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: theme.sizes.coachButtonClearance }}>
        <ScreenHeader title="Calendar" action={<Button label="Today" variant="secondary" onPress={returnToToday} />} />
        <Box paddingHorizontal="medium">
          <Typography variant="heading" accessibilityRole="header">
            {monthLabelForWeek(visibleWeekStart)}
          </Typography>
        </Box>
        <WeekStrip
          ref={weekStripReference}
          weekStarts={weekStarts}
          initialWeekIndex={initialWeekIndex}
          selectedDate={selectedDate}
          today={todayDate}
          onSelectDate={selectDate}
          onVisibleWeekChange={changeVisibleWeek}
          onReachEarliestWeeks={prependWeeks}
          onReachLatestWeeks={appendWeeks}
        />
        <Box paddingHorizontal="medium" paddingVertical="small">
          <Typography variant="title" accessibilityRole="header">
            {formatFullDate(selectedDate)}
          </Typography>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
