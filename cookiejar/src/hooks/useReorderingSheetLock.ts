import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';

export function useReorderingSheetLock() {
  const navigation = useNavigation();
  const { isReordering, setIsReordering } = useWorkoutEditor();

  useEffect(() => {
    const builderNavigation = navigation.getParent();
    if (!isReordering || builderNavigation === undefined) {
      return;
    }
    builderNavigation.setOptions({ gestureEnabled: false });
    return () => builderNavigation.setOptions({ gestureEnabled: true });
  }, [isReordering, navigation]);

  useEffect(() => () => setIsReordering(false), [setIsReordering]);

  return setIsReordering;
}
