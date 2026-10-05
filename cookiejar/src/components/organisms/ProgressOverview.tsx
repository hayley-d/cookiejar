import type { ReactNode } from 'react';

import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { missingHealthValue } from '@/health/formatSteps';
import { formatTimeTrained, formatVolume } from '@/progress/formatTrainingTotals';
import type { TrainingTotals } from '@/types/TrainingTotals';

type ProgressOverviewProperties = {
  monthTotals: TrainingTotals;
  newRecordCount: number | null;
  children?: ReactNode;
};

export function ProgressOverview({ monthTotals, newRecordCount, children }: ProgressOverviewProperties) {
  return (
    <Box gap="large">
      <Box gap="small">
        <Typography variant="heading">This month</Typography>
        <Box direction="row" gap="small">
          <StatTile
            icon="figure.strengthtraining.traditional"
            label="Workouts"
            value={String(monthTotals.workoutCount)}
          />
          <StatTile icon="clock.fill" label="Time trained" value={formatTimeTrained(monthTotals.timeTrainedSeconds)} />
        </Box>
        <Box direction="row" gap="small">
          <StatTile icon="scalemass.fill" label="Volume lifted" value={formatVolume(monthTotals.volumeKilograms)} />
          <StatTile icon="trophy.fill" label="New records" value={newRecordCount === null ? missingHealthValue : String(newRecordCount)} />
        </Box>
      </Box>
      {children}
    </Box>
  );
}
