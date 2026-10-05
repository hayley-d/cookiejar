export type CopyableEntry = {
  workoutId: number;
  timeOfDay: string;
};

export type CopyDayTarget = {
  dayOfWeek: number;
  existingEntries: readonly CopyableEntry[];
};

export type PlannedEntryInsert = CopyableEntry & {
  dayOfWeek: number;
};

function entryKey(entry: CopyableEntry): string {
  return `${entry.workoutId}@${entry.timeOfDay}`;
}

export function planCopyDay(
  sourceEntries: readonly CopyableEntry[],
  sourceDayOfWeek: number,
  targets: readonly CopyDayTarget[],
): PlannedEntryInsert[] {
  const plannedInserts: PlannedEntryInsert[] = [];
  const handledDays = new Set<number>([sourceDayOfWeek]);

  for (const target of targets) {
    if (handledDays.has(target.dayOfWeek)) {
      continue;
    }
    handledDays.add(target.dayOfWeek);

    const occupiedKeys = new Set(target.existingEntries.map(entryKey));
    for (const sourceEntry of sourceEntries) {
      const key = entryKey(sourceEntry);
      if (occupiedKeys.has(key)) {
        continue;
      }
      occupiedKeys.add(key);
      plannedInserts.push({
        dayOfWeek: target.dayOfWeek,
        workoutId: sourceEntry.workoutId,
        timeOfDay: sourceEntry.timeOfDay,
      });
    }
  }

  return plannedInserts;
}
