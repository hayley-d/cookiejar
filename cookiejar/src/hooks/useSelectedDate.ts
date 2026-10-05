import { useCallback, useState } from 'react';

import { selectedDateAfterWeekChange } from '@/dates/weekPages';

export type SelectedDate = {
  selectedDate: string;
  selectDate: (date: string) => void;
  followVisibleWeek: (weekStart: string) => void;
};

export function useSelectedDate(today: string): SelectedDate {
  const [selectedDate, setSelectedDate] = useState(today);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const followVisibleWeek = useCallback(
    (weekStart: string) => {
      setSelectedDate((previousSelectedDate) =>
        selectedDateAfterWeekChange({ selectedDate: previousSelectedDate, weekStart, today }),
      );
    },
    [today],
  );

  return { selectedDate, selectDate, followVisibleWeek };
}
