import { parseLocalDateString } from '@/dates/parseLocalDateString';

const millisecondsPerDay = 86_400_000;

export function toChartDayNumber(localDate: string): number {
  const date = parseLocalDateString(localDate);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / millisecondsPerDay;
}

export function fromChartDayNumber(dayNumber: number): string {
  const date = new Date(Math.round(dayNumber) * millisecondsPerDay);
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function chartDayTicks(dayNumbers: number[]): number[] {
  if (dayNumbers.length === 0) {
    return [];
  }
  const firstDay = Math.min(...dayNumbers);
  const lastDay = Math.max(...dayNumbers);
  const ticks = [firstDay, Math.round((firstDay + lastDay) / 2), lastDay];
  return ticks.filter((tick, index) => ticks.indexOf(tick) === index);
}
