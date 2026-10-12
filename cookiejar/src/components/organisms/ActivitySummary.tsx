import { Badge } from '@/components/atoms/Badge';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Button } from '@/components/atoms/Button';
import { LinkedHealthWorkoutRow } from '@/components/molecules/LinkedHealthWorkoutRow';
import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import {
  formatActiveKilocalories,
  formatAverageHeartRate,
  formatDistance,
  formatElevationGain,
} from '@/activities/formatActivityValues';
import { describePace } from '@/activities/derivePace';
import { formatFullDate } from '@/dates/formatFullDate';
import type { NuggieName } from '@/nuggies/NuggieName';
import { elapsedSecondsBetween } from '@/sessions/calculateSessionTotals';
import { formatSessionDuration } from '@/sessions/formatSessionValues';
import type { Session } from '@/types/Session';

const nuggieSize = 96;
const tilesPerRow = 3;

type ActivitySummaryProperties = {
  session: Session;
  nuggie: NuggieName;
  newBestLabels: readonly string[];
  now: Date;
  onDone: () => void;
  onEdit: () => void;
  onUnlinkGarmin: () => void;
};

type ActivityTile = {
  label: string;
  value: string;
};

function buildActivityTiles(session: Session, durationSeconds: number): ActivityTile[] {
  const pace = describePace(session.distanceMeters, durationSeconds);
  const tiles: (ActivityTile | null)[] = [
    session.distanceMeters === null ? null : { label: 'Distance', value: formatDistance(session.distanceMeters) },
    { label: 'Duration', value: formatSessionDuration(durationSeconds) },
    pace === null ? null : { label: 'Pace', value: pace },
    session.elevationGainMeters === null
      ? null
      : { label: 'Elevation', value: formatElevationGain(session.elevationGainMeters) },
    session.activeKilocalories === null
      ? null
      : { label: 'Calories', value: formatActiveKilocalories(session.activeKilocalories) },
    session.averageHeartRate === null
      ? null
      : { label: 'Avg heart rate', value: formatAverageHeartRate(session.averageHeartRate) },
  ];
  return tiles.filter((tile): tile is ActivityTile => tile !== null);
}

function chunkTiles(tiles: ActivityTile[]): ActivityTile[][] {
  const rows: ActivityTile[][] = [];
  for (let startIndex = 0; startIndex < tiles.length; startIndex += tilesPerRow) {
    rows.push(tiles.slice(startIndex, startIndex + tilesPerRow));
  }
  return rows;
}

export function ActivitySummary({ session, nuggie, newBestLabels, now, onDone, onEdit, onUnlinkGarmin }: ActivitySummaryProperties) {
  const endedAt = session.finishedAt === null ? now : new Date(session.finishedAt);
  const durationSeconds = elapsedSecondsBetween(session.startedAt, endedAt);
  const tileRows = chunkTiles(buildActivityTiles(session, durationSeconds));
  const trimmedNotes = session.notes?.trim() ?? '';

  return (
    <ScrollBox gap="large">
      <Box align="center" gap="medium">
        <NuggieImage name={nuggie} size={nuggieSize} shape="circle" />
        <Typography variant="label" color="textSecondary" align="center">
          {`${session.workoutName.toUpperCase()} · ${formatFullDate(session.scheduledDate)}`}
        </Typography>
        {newBestLabels.map((label) => (
          <Badge key={label} label={`NEW BEST · ${label}`} />
        ))}
      </Box>
      {tileRows.map((tileRow) => (
        <Box key={tileRow[0].label} direction="row" gap="small">
          {tileRow.map((tile) => (
            <StatTile key={tile.label} value={tile.value} label={tile.label} />
          ))}
          {Array.from({ length: tilesPerRow - tileRow.length }, (_, fillerIndex) => (
            <Box key={`filler-${fillerIndex}`} flex={1} />
          ))}
        </Box>
      ))}
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
      <Box align="center" gap="small">
        <Button label="Edit" onPress={onEdit} variant="secondary" />
        <Button label="Done" onPress={onDone} />
      </Box>
    </ScrollBox>
  );
}
