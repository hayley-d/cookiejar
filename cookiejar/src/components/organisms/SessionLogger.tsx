import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ElapsedTimer } from '@/components/atoms/ElapsedTimer';
import { TextButton } from '@/components/atoms/TextButton';
import { RestTimerBar } from '@/components/molecules/RestTimerBar';
import { SessionExerciseCard } from '@/components/organisms/SessionExerciseCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { TextField } from '@/components/primitives/TextField';
import { Typography } from '@/components/primitives/Typography';
import { useRestTimer } from '@/hooks/useRestTimer';
import type { PreviousSessionSet } from '@/sessions/describePreviousSet';
import type { SetCompletionOutcome, SetValues } from '@/sessions/fillSetForTick';
import { toSupersetCardPositions } from '@/workouts/supersetCardPositions';
import { useTheme } from '@/theme/useTheme';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

type SessionLoggerProperties = {
  session: SessionWithExercises;
  isFinishing: boolean;
  previousSetsByExerciseId: Map<number, PreviousSessionSet[]>;
  onChangeSetValues: (sessionSetId: number, changes: Partial<SetValues>) => void;
  onToggleSetCompletion: (sessionSetId: number) => SetCompletionOutcome;
  onAddSet: (sessionExerciseId: number) => void;
  onRemoveSet: (sessionExerciseId: number, sessionSetId: number) => void;
  onChangeRest: (sessionExerciseId: number, restSeconds: number | null) => void;
  onReplaceExercise: (sessionExerciseId: number) => void;
  onRemoveExercise: (sessionExerciseId: number) => void;
  onAddExercises: () => void;
  onChangeNotes: (notes: string) => void;
  onFinish: () => void;
  onDiscard: () => void;
};

function SessionRestTimerBar() {
  const restTimer = useRestTimer();
  if (restTimer.remainingSeconds === null) {
    return null;
  }
  return (
    <RestTimerBar
      remainingSeconds={restTimer.remainingSeconds}
      isPaused={restTimer.isPaused}
      onTogglePause={restTimer.isPaused ? restTimer.resume : restTimer.pause}
    />
  );
}

export function SessionLogger({
  session,
  isFinishing,
  previousSetsByExerciseId,
  onChangeSetValues,
  onToggleSetCompletion,
  onAddSet,
  onRemoveSet,
  onChangeRest,
  onReplaceExercise,
  onRemoveExercise,
  onAddExercises,
  onChangeNotes,
  onFinish,
  onDiscard,
}: SessionLoggerProperties) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const cardPositions = toSupersetCardPositions(session.exercises);

  return (
    <Box flex={1} background="background">
      <Box
        direction="row"
        align="center"
        gap="small"
        paddingHorizontal="medium"
        style={{ paddingTop: safeAreaInsets.top + theme.spacing.small, paddingBottom: theme.spacing.small }}
      >
        <TextButton label="✕ Discard" color="danger" onPress={onDiscard} disabled={isFinishing} />
        <Box flex={1}>
          <Typography variant="heading" numberOfLines={1} accessibilityRole="header">
            {session.workoutName.toUpperCase()}
          </Typography>
        </Box>
        <ElapsedTimer startedAt={session.startedAt} />
        <TextButton label="Finish" onPress={onFinish} disabled={isFinishing} />
      </Box>
      <SessionRestTimerBar />
      <ScrollBox automaticallyAdjustKeyboardInsets contentInsetAdjustmentBehavior="never">
        {session.exercises.length === 0 ? (
          <Typography color="textSecondary" align="center">
            This workout has no exercises.
          </Typography>
        ) : (
          session.exercises.map((sessionExercise, index) => (
            <SessionExerciseCard
              key={sessionExercise.id}
              sessionExercise={sessionExercise}
              label={cardPositions[index]?.label ?? null}
              bracket={cardPositions[index]?.bracket ?? null}
              previousSets={previousSetsByExerciseId.get(sessionExercise.exerciseId) ?? []}
              onChangeSetValues={onChangeSetValues}
              onToggleSetCompletion={onToggleSetCompletion}
              onAddSet={() => onAddSet(sessionExercise.id)}
              onRemoveSet={(sessionSetId) => onRemoveSet(sessionExercise.id, sessionSetId)}
              onChangeRest={(restSeconds) => onChangeRest(sessionExercise.id, restSeconds)}
              onReplace={() => onReplaceExercise(sessionExercise.id)}
              onRemove={() => onRemoveExercise(sessionExercise.id)}
            />
          ))
        )}
        <Box align="center">
          <TextButton label="+ ADD EXERCISE" onPress={onAddExercises} />
        </Box>
        <TextField
          value={session.notes ?? ''}
          onChangeText={onChangeNotes}
          placeholder="Notes"
          accessibilityLabel="Session notes"
          multiline
          textAlignVertical="top"
          style={{ minHeight: theme.sizes.sessionNotesMinimumHeight }}
        />
        <Box style={{ height: safeAreaInsets.bottom }} />
      </ScrollBox>
    </Box>
  );
}
