import { formatSwimTime } from '@/swimming/formatSwimTime';
import type { SwimSet } from '@/swimming/swimTypes';
import { swimEquipmentLabels } from '@/types/SwimEquipment';

type DescribedSwimSet = Pick<
  SwimSet,
  | 'exerciseName'
  | 'repetitions'
  | 'distanceMeters'
  | 'restMode'
  | 'restSeconds'
  | 'sendOffSeconds'
  | 'restAfterSeconds'
  | 'equipment'
  | 'notes'
>;

export function describeSwimSet(set: DescribedSwimSet): string {
  const sendOffText =
    set.restMode === 'send_off' && set.sendOffSeconds !== null ? ` @ ${formatSwimTime(set.sendOffSeconds)}` : '';
  const parts = [`${set.repetitions}×${set.distanceMeters} m ${set.exerciseName}${sendOffText}`];
  if (set.restMode === 'fixed' && set.restSeconds !== null && set.restSeconds > 0) {
    parts.push(`rest ${formatSwimTime(set.restSeconds)}`);
  }
  if (set.equipment.length > 0) {
    parts.push(set.equipment.map((equipment) => swimEquipmentLabels[equipment]).join(', '));
  }
  if (set.restAfterSeconds !== null) {
    parts.push(`then rest ${formatSwimTime(set.restAfterSeconds)}`);
  }
  const trimmedNotes = set.notes?.trim() ?? '';
  if (trimmedNotes.length > 0) {
    parts.push(`"${trimmedNotes}"`);
  }
  return parts.join(' · ');
}

export function describeSwimRounds(rounds: number): string | null {
  return rounds > 1 ? `${rounds} rounds` : null;
}

export function describeSwimBlockRest(restAfterSeconds: number | null): string | null {
  return restAfterSeconds === null ? null : `Rest ${formatSwimTime(restAfterSeconds)}`;
}
