export function calculateBodyMassIndex(
  weightKilograms: number | null,
  heightCentimetres: number | null,
): number | null {
  if (weightKilograms === null || heightCentimetres === null || heightCentimetres <= 0) {
    return null;
  }
  const heightMetres = heightCentimetres / 100;
  return Math.round((weightKilograms / (heightMetres * heightMetres)) * 10) / 10;
}
