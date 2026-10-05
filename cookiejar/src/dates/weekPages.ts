import { addDays } from '@/dates/addDays';
import { monthNames } from '@/dates/calendarNames';
import { dayOfWeekNumber } from '@/dates/dayOfWeekNumber';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';

export const startingWeekPagesEachSide = 8;
export const weekPagesPerExtension = 8;

const daysPerWeek = 7;
const thursdayOffsetFromMonday = 3;
const pageAlignmentTolerance = 0.5;

function toDate(date: Date | string): Date {
  return typeof date === 'string' ? parseLocalDateString(date) : date;
}

function weekStartOf(date: Date | string): string {
  return toLocalDateString(startOfWeek(toDate(date)));
}

function shiftWeekStart(weekStart: string, weekCount: number): string {
  return toLocalDateString(addDays(parseLocalDateString(weekStart), weekCount * daysPerWeek));
}

function consecutiveWeekStarts(firstWeekStart: string, weekCount: number): string[] {
  return Array.from({ length: weekCount }, (unused, index) => shiftWeekStart(firstWeekStart, index));
}

export function buildStartingWeekPages(centreDate: Date): string[] {
  const firstWeekStart = shiftWeekStart(weekStartOf(centreDate), -startingWeekPagesEachSide);
  return consecutiveWeekStarts(firstWeekStart, startingWeekPagesEachSide * 2 + 1);
}

export function prependWeekPages(weekStarts: readonly string[], weekCount = weekPagesPerExtension): string[] {
  if (weekStarts.length === 0) {
    return [];
  }
  const firstWeekStart = shiftWeekStart(weekStarts[0], -weekCount);
  return [...consecutiveWeekStarts(firstWeekStart, weekCount), ...weekStarts];
}

export function appendWeekPages(weekStarts: readonly string[], weekCount = weekPagesPerExtension): string[] {
  if (weekStarts.length === 0) {
    return [];
  }
  const nextWeekStart = shiftWeekStart(weekStarts[weekStarts.length - 1], 1);
  return [...weekStarts, ...consecutiveWeekStarts(nextWeekStart, weekCount)];
}

export function weekPageIndexContaining(weekStarts: readonly string[], date: Date | string): number {
  return weekStarts.indexOf(weekStartOf(date));
}

export function weekPageDates(weekStart: string): string[] {
  const monday = parseLocalDateString(weekStart);
  return Array.from({ length: daysPerWeek }, (unused, index) => toLocalDateString(addDays(monday, index)));
}

export function monthLabelForWeek(weekStart: string): string {
  const thursday = addDays(parseLocalDateString(weekStart), thursdayOffsetFromMonday);
  return `${monthNames[thursday.getMonth()]} ${thursday.getFullYear()}`;
}

type WeekChange = {
  selectedDate: string;
  weekStart: string;
  today: string;
};

export function selectedDateAfterWeekChange({ selectedDate, weekStart, today }: WeekChange): string {
  if (weekStartOf(selectedDate) === weekStart) {
    return selectedDate;
  }
  if (weekStartOf(today) === weekStart) {
    return today;
  }
  const weekdayOffset = dayOfWeekNumber(parseLocalDateString(selectedDate)) - 1;
  return toLocalDateString(addDays(parseLocalDateString(weekStart), weekdayOffset));
}

export function isPageAligned(offset: number, pageWidth: number): boolean {
  if (pageWidth <= 0) {
    return false;
  }
  const distanceFromPage = Math.abs(offset - Math.round(offset / pageWidth) * pageWidth);
  return distanceFromPage <= pageAlignmentTolerance;
}
