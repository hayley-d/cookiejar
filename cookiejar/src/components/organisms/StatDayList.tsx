import { Card } from '@/components/atoms/Card';
import { StatDayRow } from '@/components/molecules/StatDayRow';
import { Box } from '@/components/primitives/Box';
import type { StatDay } from '@/stats/describeStatDays';

type StatDayListProperties = {
  statDays: readonly StatDay[];
};

export function StatDayList({ statDays }: StatDayListProperties) {
  return (
    <Card>
      <Box gap="medium">
        {statDays.map((statDay) => (
          <StatDayRow key={statDay.date} statDay={statDay} />
        ))}
      </Box>
    </Card>
  );
}
