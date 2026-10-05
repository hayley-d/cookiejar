import { Alert } from 'react-native';
import { useNavigation, useRoute } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';

import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';

export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const navigation = useNavigation();
  const route = useRoute();
  const { isLeavingPermitted, leaveWithoutPrompt } = useWorkoutEditor();
  const isFirstRouteOfBuilder = navigation.getState()?.routes[0]?.key === route.key;
  const shouldPrevent = hasUnsavedChanges && isFirstRouteOfBuilder && !isLeavingPermitted;

  usePreventRemove(shouldPrevent, ({ data }) => {
    Alert.alert('Discard changes?', 'Your changes to this workout will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => leaveWithoutPrompt(() => navigation.dispatch(data.action)),
      },
    ]);
  });
}
