import { useCallback, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ViewToken } from 'react-native';

import { DayChip } from '@/components/molecules/DayChip';
import { Box } from '@/components/primitives/Box';
import { PagedList, type PagedListHandle } from '@/components/primitives/PagedList';
import { formatFullDate } from '@/dates/formatFullDate';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { isPageAligned, weekPageDates } from '@/dates/weekPages';
import { weekdays } from '@/plans/weekdays';

export type WeekStripHandle = {
  scrollToWeekIndex: (weekIndex: number) => void;
};

type WeekStripProperties = {
  ref?: Ref<WeekStripHandle>;
  weekStarts: readonly string[];
  initialWeekIndex: number;
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
  onVisibleWeekChange: (weekStart: string) => void;
  onReachEarliestWeeks: () => void;
  onReachLatestWeeks: () => void;
  renderMarker?: (date: string) => ReactNode;
};

const edgeThresholdInPages = 3;
const renderedPagesWindow = 7;
const viewabilityConfig = { itemVisiblePercentThreshold: 51 };

export function WeekStrip({
  ref,
  weekStarts,
  initialWeekIndex,
  selectedDate,
  today,
  onSelectDate,
  onVisibleWeekChange,
  onReachEarliestWeeks,
  onReachLatestWeeks,
  renderMarker,
}: WeekStripProperties) {
  const [pageWidth, setPageWidth] = useState(0);
  const listReference = useRef<PagedListHandle<string>>(null);
  const mostVisibleWeekStartReference = useRef<string | null>(weekStarts[initialWeekIndex] ?? null);
  const isScrollingReference = useRef(false);
  const hasPendingEarlierWeeksReference = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      scrollToWeekIndex: (weekIndex: number) => {
        listReference.current?.scrollToIndex({ index: weekIndex, animated: true });
      },
    }),
    [],
  );

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken<string>[] }) => {
    const mostVisibleItem = viewableItems[0];
    if (mostVisibleItem) {
      mostVisibleWeekStartReference.current = mostVisibleItem.item;
    }
  }, []);

  const settleScroll = useCallback(() => {
    isScrollingReference.current = false;
    if (mostVisibleWeekStartReference.current !== null) {
      onVisibleWeekChange(mostVisibleWeekStartReference.current);
    }
    if (hasPendingEarlierWeeksReference.current) {
      hasPendingEarlierWeeksReference.current = false;
      onReachEarliestWeeks();
    }
  }, [onVisibleWeekChange, onReachEarliestWeeks]);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const horizontalVelocity = event.nativeEvent.velocity?.x ?? 0;
      if (horizontalVelocity === 0 && isPageAligned(event.nativeEvent.contentOffset.x, pageWidth)) {
        settleScroll();
      }
    },
    [pageWidth, settleScroll],
  );

  const handleStartReached = useCallback(() => {
    if (isScrollingReference.current) {
      hasPendingEarlierWeeksReference.current = true;
      return;
    }
    onReachEarliestWeeks();
  }, [onReachEarliestWeeks]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setPageWidth(event.nativeEvent.layout.width);
  }, []);

  const getItemLayout = useCallback(
    (data: ArrayLike<string> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth],
  );

  const renderWeek = useCallback(
    ({ item: weekStart }: { item: string }) => (
      <Box
        direction="row"
        align="center"
        justify="space-around"
        paddingHorizontal="small"
        paddingVertical="small"
        style={{ width: pageWidth }}
      >
        {weekPageDates(weekStart).map((date, weekdayIndex) => (
          <DayChip
            key={date}
            weekdayLetter={weekdays[weekdayIndex].name.charAt(0)}
            dayOfMonth={parseLocalDateString(date).getDate()}
            isSelected={date === selectedDate}
            isToday={date === today}
            accessibilityLabel={formatFullDate(date)}
            onPress={() => onSelectDate(date)}
            marker={renderMarker?.(date)}
          />
        ))}
      </Box>
    ),
    [pageWidth, selectedDate, today, onSelectDate, renderMarker],
  );

  return (
    <Box onLayout={handleLayout}>
      {pageWidth > 0 ? (
        <PagedList
          ref={listReference}
          data={weekStarts}
          keyExtractor={(weekStart) => weekStart}
          renderItem={renderWeek}
          extraData={renderWeek}
          getItemLayout={getItemLayout}
          initialScrollIndex={initialWeekIndex}
          windowSize={renderedPagesWindow}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onStartReached={handleStartReached}
          onStartReachedThreshold={edgeThresholdInPages}
          onEndReached={onReachLatestWeeks}
          onEndReachedThreshold={edgeThresholdInPages}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={handleViewableItemsChanged}
          onScrollBeginDrag={() => {
            isScrollingReference.current = true;
          }}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={settleScroll}
        />
      ) : null}
    </Box>
  );
}
