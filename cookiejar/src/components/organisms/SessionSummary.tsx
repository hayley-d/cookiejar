import { Button } from '@/components/atoms/Button';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { HealthSuggestionBanner } from '@/components/molecules/HealthSuggestionBanner';
import { LinkedHealthWorkoutRow } from '@/components/molecules/LinkedHealthWorkoutRow';
import { PersonalRecordRow } from '@/components/molecules/PersonalRecordRow';
import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { formatFullDate } from '@/dates/formatFullDate';
import { describeWorkoutActivity } from '@/health/describeWorkoutActivity';
import type { HealthWorkout } from '@/health/HealthTypes';
import { describePersonalRecordDetail } from '@/progress/describePersonalRecord';
import { selectBestRecordPerExercise, type PersonalRecord } from '@/progress/detectPersonalRecords';
import type { NuggieName } from '@/nuggies/NuggieName';
import { calculateSessionTotals } from '@/sessions/calculateSessionTotals';
import { describeExerciseBestSet } from '@/sessions/describeExerciseBestSet';
import { formatSessionDuration, formatSetCount, formatVolume } from '@/sessions/formatSessionValues';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

const isGarminLinkEnabled = true;
const nuggieSize = 96;

type SessionSummaryProperties = {
  session: SessionWithExercises;
  personalRecords: readonly PersonalRecord[];
  nuggie: NuggieName;
  now: Date;
  onDone: () => void;
  suggestedWorkout: HealthWorkout | null;
  isLinkingSuggestedWorkout: boolean;
  onLinkSuggestedWorkout: () => void;
  onLinkGarmin: () => void;
  onUnlinkGarmin: () => void;
};

export function SessionSummary({
  session,
  personalRecords,
  nuggie,
  now,
  onDone,
  suggestedWorkout,
  isLinkingSuggestedWorkout,
  onLinkSuggestedWorkout,
  onLinkGarmin,
  onUnlinkGarmin,
}: SessionSummaryProperties) {
  const totals = calculateSessionTotals(session, now);
  const bestRecords = selectBestRecordPerExercise(personalRecords);
  const exerciseNames = new Map(
    session.exercises.map((sessionExercise) => [sessionExercise.exerciseId, sessionExercise.exercise.name]),
  );
  const completedExercises = session.exercises.filter((sessionExercise) =>
    sessionExercise.sets.some((set) => set.completedAt !== null),
  );
  const trimmedNotes = session.notes?.trim() ?? '';

  return (
    <ScrollBox gap="large">
      <Box align="center" gap="medium">
        <NuggieImage name={nuggie} size={nuggieSize} shape="circle" />
        <Typography variant="label" color="textSecondary" align="center">
          {`${session.workoutName.toUpperCase()} · ${formatFullDate(session.scheduledDate)}`}
        </Typography>
      </Box>
      <Box direction="row" gap="small">
        <StatTile value={formatSessionDuration(totals.durationSeconds)} label="Duration" />
        <StatTile value={formatVolume(totals.volumeKilograms)} label="Volume" />
        <StatTile value={formatSetCount(totals.completedSetCount)} label="Sets done" />
      </Box>
      {bestRecords.length === 0 ? null : (
        <Box gap="small">
          <Typography variant="heading">Personal records</Typography>
          {bestRecords.map((record) => (
            <PersonalRecordRow
              key={record.exerciseId}
              exerciseName={exerciseNames.get(record.exerciseId) ?? 'Exercise'}
              detail={describePersonalRecordDetail(record)}
            />
          ))}
        </Box>
      )}
      {completedExercises.length === 0 ? null : (
        <Box gap="small">
          <Typography variant="heading">Exercises</Typography>
          {completedExercises.map((sessionExercise) => {
            const completedSetCount = sessionExercise.sets.filter((set) => set.completedAt !== null).length;
            const bestSet = describeExerciseBestSet(sessionExercise.trackingType, sessionExercise.sets);
            return (
              <Box key={sessionExercise.id} direction="row" justify="space-between" gap="medium">
                <Typography variant="body" style={{ flex: 1 }}>
                  {sessionExercise.exercise.name}
                </Typography>
                <Typography variant="body" color="textSecondary">
                  {bestSet === null
                    ? formatSetCount(completedSetCount)
                    : `${formatSetCount(completedSetCount)}  best ${bestSet}`}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
      {isGarminLinkEnabled && session.healthWorkoutUuid === null ? (
        <Box gap="small">
          {suggestedWorkout === null ? null : (
            <HealthSuggestionBanner
              activityName={describeWorkoutActivity(suggestedWorkout.activityTypeCode)}
              durationLabel={formatSessionDuration(suggestedWorkout.durationSeconds)}
              isLinking={isLinkingSuggestedWorkout}
              onLink={onLinkSuggestedWorkout}
            />
          )}
          <Button label="Link Garmin workout" variant="secondary" onPress={onLinkGarmin} />
        </Box>
      ) : null}
      {session.healthWorkoutUuid === null ? null : (
        <LinkedHealthWorkoutRow
          averageHeartRate={session.healthAverageHeartRate}
          maximumHeartRate={session.healthMaximumHeartRate}
          activeKilocalories={session.healthActiveKilocalories}
          durationSeconds={session.healthDurationSeconds}
          onUnlink={onUnlinkGarmin}
        />
      )}
      {trimmedNotes.length === 0 ? null : (
        <Box gap="small">
          <Typography variant="heading">Notes</Typography>
          <Typography variant="body">{trimmedNotes}</Typography>
        </Box>
      )}
      <Box align="center">
        <Button label="Done" onPress={onDone} />
      </Box>
    </ScrollBox>
  );
}
