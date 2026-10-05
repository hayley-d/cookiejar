import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export function useFocusReloadKey(): number {
  const [focusCount, setFocusCount] = useState(0);
  const hasFocusedBefore = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedBefore.current) {
        hasFocusedBefore.current = true;
        return;
      }
      setFocusCount((previousFocusCount) => previousFocusCount + 1);
    }, []),
  );

  return focusCount;
}
