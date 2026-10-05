import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { formatShortDate } from '@/dates/formatShortDate';
import type { ExerciseSession } from '@/progress/buildExerciseSessions';

type ExerciseHistoryListProperties = {
  sessions: readonly ExerciseSession[];
};

export function ExerciseHistoryList({ sessions }: ExerciseHistoryListProperties) {
  return (
    <Box gap="medium">
      {sessions.map((session) => (
        <Box key={session.sessionId} gap="extraSmall">
          <Typography variant="label">{formatShortDate(session.date)}</Typography>
          <Typography variant="caption" color="textSecondary">
            {session.workoutName}
          </Typography>
          {session.sets.map((set) => (
            <Typography
              key={set.setId}
              variant="body"
              accessibilityLabel={set.isRecord ? `${set.description}, personal record` : set.description}
            >
              {set.isRecord ? `${set.description} 🏆` : set.description}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
}
