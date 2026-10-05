import { useCallback, useMemo, useState } from 'react';

import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';
import {
  appendWeekPages,
  buildStartingWeekPages,
  prependWeekPages,
  startingWeekPagesEachSide,
  weekPageIndexContaining,
} from '@/dates/weekPages';

export type WeekPages = {
  weekStarts: string[];
  initialWeekIndex: number;
  currentWeekIndex: number;
  currentWeekStart: string;
  visibleWeekStart: string;
  showWeek: (weekStart: string) => void;
  prependWeeks: () => void;
  appendWeeks: () => void;
};

export function useWeekPages(centreDate: Date): WeekPages {
  const centreWeekStart = toLocalDateString(startOfWeek(centreDate));
  const [weekStarts, setWeekStarts] = useState(() => buildStartingWeekPages(centreDate));
  const [visibleWeekStart, setVisibleWeekStart] = useState(centreWeekStart);

  const currentWeekIndex = useMemo(
    () => weekPageIndexContaining(weekStarts, centreWeekStart),
    [weekStarts, centreWeekStart],
  );

  const showWeek = useCallback((weekStart: string) => {
    setVisibleWeekStart(weekStart);
  }, []);

  const prependWeeks = useCallback(() => {
    setWeekStarts((previousWeekStarts) => prependWeekPages(previousWeekStarts));
  }, []);

  const appendWeeks = useCallback(() => {
    setWeekStarts((previousWeekStarts) => appendWeekPages(previousWeekStarts));
  }, []);

  return {
    weekStarts,
    initialWeekIndex: startingWeekPagesEachSide,
    currentWeekIndex,
    currentWeekStart: centreWeekStart,
    visibleWeekStart,
    showWeek,
    prependWeeks,
    appendWeeks,
  };
}
