import { Card } from '@/components/atoms/Card';
import { StatBarRow } from '@/components/molecules/StatBarRow';
import { Box } from '@/components/primitives/Box';

export type StatBarListRow = {
  date: string;
  dateLabel: string;
  valueText: string;
  fraction: number;
};

type StatBarListProperties = {
  rows: readonly StatBarListRow[];
};

export function StatBarList({ rows }: StatBarListProperties) {
  return (
    <Card>
      <Box gap="medium">
        {rows.map((row) => (
          <StatBarRow key={row.date} dateLabel={row.dateLabel} valueText={row.valueText} fraction={row.fraction} />
        ))}
      </Box>
    </Card>
  );
}
