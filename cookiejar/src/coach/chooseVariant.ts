import { dayOfYear } from '@/dates/dayOfYear';

export function chooseVariant<Variant>(date: Date, variants: readonly [Variant, Variant]): Variant {
  return variants[dayOfYear(date) % variants.length];
}
