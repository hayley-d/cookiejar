import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { consumeWorkoutSavedNotice, type WorkoutSavedNotice } from '@/stores/workoutSavedStore';

export function useWorkoutSavedNoticeOnFocus() {
  const [notice, setNotice] = useState<WorkoutSavedNotice | null>(null);

  useFocusEffect(
    useCallback(() => {
      const consumedNotice = consumeWorkoutSavedNotice();
      if (consumedNotice !== null) {
        setNotice(consumedNotice);
      }
    }, []),
  );

  return notice;
}
