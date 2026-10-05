import { bodyParts, type BodyPart } from '@/types/BodyPart';

export function parseBodyPartParameter(parameter: string | string[] | undefined): BodyPart | null {
  if (typeof parameter !== 'string') {
    return null;
  }
  return bodyParts.find((bodyPart) => bodyPart === parameter) ?? null;
}
