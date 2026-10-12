import { Button } from '@/components/atoms/Button';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { formatFullDate } from '@/dates/formatFullDate';
import type { NuggieName } from '@/nuggies/NuggieName';
import { elapsedSecondsBetween } from '@/sessions/calculateSessionTotals';
import { formatSwimDistance } from '@/swimming/swimDistance';
import { describeSwimPace } from '@/swimming/swimPace';
import { flattenSwimRepetitions, swumDistance, swumDistanceByStroke } from '@/swimming/swimSessionTotals';
import { formatSwimTime } from '@/swimming/formatSwimTime';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

const nuggieSize = 96;
const missingPaceText = '—';

type SwimSummaryProperties = {
  session: SessionWithExercises;
  nuggie: NuggieName;
  now: Date;
  onDone: () => void;
};

export function SwimSummary({ session, nuggie, now, onDone }: SwimSummaryProperties) {
  const repetitionRecords = flattenSwimRepetitions(session.swim?.sections ?? []);
  const swumMeters = swumDistance(repetitionRecords);
  const strokeDistances = swumDistanceByStroke(repetitionRecords);
  const durationSeconds = elapsedSecondsBetween(
    session.startedAt,
    session.finishedAt === null ? now : new Date(session.finishedAt),
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
        <StatTile value={formatSwimDistance(swumMeters)} label="Distance" />
        <StatTile value={formatSwimTime(durationSeconds)} label="Duration" />
        <StatTile value={describeSwimPace(durationSeconds, swumMeters) ?? missingPaceText} label="Pace" />
      </Box>
      {strokeDistances.length === 0 ? null : (
        <Box gap="small">
          <Typography variant="heading">Distance per stroke</Typography>
          {strokeDistances.map((strokeDistance) => (
            <Box key={strokeDistance.strokeName} direction="row" justify="space-between" gap="medium">
              <Typography variant="body" style={{ flex: 1 }}>
                {strokeDistance.strokeName}
              </Typography>
              <Typography variant="body" color="textSecondary">
                {formatSwimDistance(strokeDistance.distanceMeters)}
              </Typography>
            </Box>
          ))}
        </Box>
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
