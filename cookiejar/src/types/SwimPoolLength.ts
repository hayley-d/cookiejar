export type SwimPoolLength = 25 | 50;

export const swimPoolLengths: SwimPoolLength[] = [25, 50];

export const defaultSwimPoolLength: SwimPoolLength = 25;

export function isSwimPoolLength(value: number): value is SwimPoolLength {
  return value === 25 || value === 50;
}
