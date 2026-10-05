import { formatShortDate } from '@/dates/formatShortDate';
import { toLocalDateString } from '@/dates/toLocalDateString';

export function describeClassCount(sessionCount: number): string {
  return `× ${sessionCount}`;
}

export function describeLastClassDate(lastStartedAt: string): string {
  return formatShortDate(toLocalDateString(new Date(lastStartedAt)));
}
