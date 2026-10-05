import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { DaySectionHeader } from '@/components/molecules/DaySectionHeader';
import { PlanEntryRow } from '@/components/molecules/PlanEntryRow';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { describePlanEntryWorkout } from '@/plans/describePlanEntryWorkout';
import type { WeekdayEntries } from '@/plans/groupEntriesByWeekday';
import { useTheme } from '@/theme/useTheme';
import type { PlanEntryWithWorkout } from '@/types/PlanWithEntries';
import { workoutNuggie } from '@/workouts/workoutNuggie';

type PlanWeekEditorProperties = {
  days: WeekdayEntries<PlanEntryWithWorkout>[];
  onAddEntry: (dayOfWeek: number) => void;
};

function RestDay() {
  const theme = useTheme();

  return (
    <Stack direction="horizontal" gap="medium" align="center" style={{ paddingHorizontal: theme.spacing.small }}>
      <NuggieImage name={chooseNuggie({ kind: 'restDay' }, new Date())} size={theme.sizes.restDayNuggie} />
      <Typography color="textSecondary">Rest day</Typography>
    </Stack>
  );
}

export function PlanWeekEditor({ days, onAddEntry }: PlanWeekEditorProperties) {
  return (
    <ScrollBox gap="large">
      {days.map((day) => (
        <Stack key={day.dayOfWeek} gap="small">
          <DaySectionHeader title={day.name} onAdd={() => onAddEntry(day.dayOfWeek)} />
          {day.entries.length === 0 ? (
            <RestDay />
          ) : (
            <Card>
              <Stack gap="medium">
                {day.entries.map((entry) => (
                  <PlanEntryRow
                    key={entry.id}
                    timeOfDay={entry.timeOfDay}
                    name={entry.workout.name}
                    detail={describePlanEntryWorkout(entry.workout)}
                    imageUrl={entry.workout.imageUrl}
                    nuggie={workoutNuggie(entry.workout.classType)}
                  />
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      ))}
    </ScrollBox>
  );
}
