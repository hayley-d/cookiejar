import { ElapsedTimer } from '@/components/atoms/ElapsedTimer';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { TextButton } from '@/components/atoms/TextButton';
import { RestTimerBar } from '@/components/molecules/RestTimerBar';
import { SessionExerciseCard } from '@/components/organisms/SessionExerciseCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { useRestTimer } from '@/hooks/useRestTimer';
import type { SetCompletionOutcome, SetValues } from '@/sessions/fillSetForTick';
import { toSupersetCardPositions } from '@/workouts/supersetCardPositions';
import { useTheme } from '@/theme/useTheme';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

type SessionLoggerProperties = {
  session: SessionWithExercises;
  isFinishing: boolean;
  previousSetsByExerciseId: Map<number, SetValues[]>;
  onChangeSetValues: (sessionSetId: number, changes: Partial<SetValues>) => void;
  onToggleSetCompletion: (sessionSetId: number) => SetCompletionOutcome;
  onFinish: () => void;
};

export function SessionLogger({
  session,
  isFinishing,
  previousSetsByExerciseId,
  onChangeSetValues,
  onToggleSetCompletion,
  onFinish,
}: SessionLoggerProperties) {
  const theme = useTheme();
  const restTimer = useRestTimer();
  const cardPositions = toSupersetCardPositions(session.exercises);

  return (
    <Box flex={1} background="background">
      <Box direction="row" align="center" gap="small" paddingHorizontal="medium" paddingVertical="small">
        <Box flex={1}>
          <Typography variant="heading" numberOfLines={1} accessibilityRole="header">
            {session.workoutName.toUpperCase()}
          </Typography>
        </Box>
        <ElapsedTimer startedAt={session.startedAt} />
        <TextButton label="Finish" onPress={onFinish} disabled={isFinishing} />
      </Box>
      {restTimer.remainingSeconds === null ? null : (
        <RestTimerBar
          remainingSeconds={restTimer.remainingSeconds}
          isPaused={restTimer.isPaused}
          onTogglePause={restTimer.isPaused ? restTimer.resume : restTimer.pause}
        />
      )}
      {session.workoutKind === 'class' ? (
        <Box flex={1} align="center" justify="center" gap="large" padding="large">
          <NuggieImage name="workout" size={theme.sizes.sessionClassNuggie} />
          <Typography color="textSecondary" align="center">
            Class in progress. Tap Finish when you are done.
          </Typography>
        </Box>
      ) : (
        <ScrollBox automaticallyAdjustKeyboardInsets>
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
              />
            ))
          )}
        </ScrollBox>
      )}
    </Box>
  );
}
