import { router, Stack, useLocalSearchParams } from 'expo-router';

import { TextButton } from '@/components/atoms/TextButton';
import { SwimSetForm } from '@/components/organisms/SwimSetForm';
import { useSwimStrokes } from '@/hooks/useSwimStrokes';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { findSwimSet } from '@/swimming/swimEditorReducer';

type SwimSetParameters = { setKey?: string };

export default function SwimSetScreen() {
  const { setKey } = useLocalSearchParams<SwimSetParameters>();
  const { state, dispatch } = useWorkoutEditor();
  const strokes = useSwimStrokes();
  const set = state.swimDetails === null || setKey === undefined ? null : findSwimSet(state.swimDetails, setKey);

  if (state.swimDetails === null || setKey === undefined || set === null) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <TextButton label="Done" onPress={() => router.back()} /> }} />
      <SwimSetForm
        set={set}
        poolLengthMeters={state.swimDetails.poolLengthMeters}
        strokes={strokes}
        onChangeSet={(changes) => dispatch({ type: 'swimChanged', action: { type: 'setChanged', setKey, changes } })}
        onRemove={() => {
          dispatch({ type: 'swimChanged', action: { type: 'setRemoved', setKey } });
          router.back();
        }}
      />
    </>
  );
}
