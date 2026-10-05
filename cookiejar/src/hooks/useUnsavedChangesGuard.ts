import { Alert } from 'react-native';
import { useNavigation, useRoute } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';

import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { shouldGuardLeavingBuilder } from '@/workouts/shouldGuardLeavingBuilder';

export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const navigation = useNavigation();
  const route = useRoute();
  const { isLeavingPermitted, isReordering, leaveWithoutPrompt } = useWorkoutEditor();
  const routeIndex = navigation.getState()?.routes.findIndex((builderRoute) => builderRoute.key === route.key) ?? -1;
  const shouldPrevent = shouldGuardLeavingBuilder({
    hasUnsavedChanges,
    isLeavingPermitted,
    isReordering,
    routeIndex,
    routeName: route.name,
  });

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
