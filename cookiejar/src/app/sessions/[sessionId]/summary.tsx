import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { formatFullDate } from '@/dates/formatFullDate';
import { useSession } from '@/hooks/useSession';
import { calculateSessionTotals } from '@/sessions/calculateSessionTotals';
import { formatSessionDuration, formatSetCount, formatVolume } from '@/sessions/formatSessionValues';
import { useTheme } from '@/theme/useTheme';

type SessionSummaryParameters = {
  sessionId: string;
};

export default function SessionSummaryScreen() {
  const theme = useTheme();
  const { sessionId: sessionIdParameter } = useLocalSearchParams<SessionSummaryParameters>();
  const { sessionLookup } = useSession(Number(sessionIdParameter));
  const [openedAt] = useState(() => new Date());

  if (sessionLookup.status === 'missing' || sessionLookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="workout"
        title={sessionLookup.status === 'missing' ? 'Workout not found' : 'Could not open the summary'}
        message={
          sessionLookup.status === 'missing'
            ? 'This workout session may have been discarded.'
            : 'Something went wrong while loading it. Please try again.'
        }
        actionLabel="Back"
        onAction={() => router.back()}
      />
    );
  }

  if (sessionLookup.status === 'loading') {
    return null;
  }

  const { session } = sessionLookup;
  const totals = calculateSessionTotals(session, openedAt);
  const statTiles = [
    { label: 'Duration', value: formatSessionDuration(totals.durationSeconds) },
    { label: 'Volume', value: formatVolume(totals.volumeKilograms) },
    { label: 'Sets done', value: formatSetCount(totals.completedSetCount) },
  ];

  return (
    <ScrollBox gap="large">
      <Box gap="extraSmall">
        <Typography variant="display">{session.workoutName}</Typography>
        <Typography color="textSecondary">{formatFullDate(session.scheduledDate)}</Typography>
      </Box>
      <Box direction="row" gap="small">
        {statTiles.map((statTile) => (
          <Card
            key={statTile.label}
            padding="small"
            accessible
            accessibilityLabel={`${statTile.label} ${statTile.value}`}
            style={{ flex: 1, minHeight: theme.sizes.statTileMinimumHeight, justifyContent: 'center' }}
          >
            <Typography variant="heading" align="center">
              {statTile.value}
            </Typography>
            <Typography variant="caption" color="textSecondary" align="center">
              {statTile.label}
            </Typography>
          </Card>
        ))}
      </Box>
      <Box align="center">
        <Button label="Done" onPress={() => router.back()} />
      </Box>
    </ScrollBox>
  );
}
