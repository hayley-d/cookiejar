import { Card } from '@/components/atoms/Card';
import { DaySectionHeader } from '@/components/molecules/DaySectionHeader';
import { PlanEntryRow } from '@/components/molecules/PlanEntryRow';
import { RestDay } from '@/components/molecules/RestDay';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Stack } from '@/components/primitives/Stack';
import { describePlanEntryWorkout } from '@/plans/describePlanEntryWorkout';
import type { WeekdayEntries } from '@/plans/groupEntriesByWeekday';
import type { PlanEntryWithWorkout } from '@/types/PlanWithEntries';
import { workoutNuggie } from '@/workouts/workoutNuggie';

type PlanWeekEditorProperties = {
  days: WeekdayEntries<PlanEntryWithWorkout>[];
  onAddEntry: (dayOfWeek: number) => void;
};

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
