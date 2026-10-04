export type BodyMeasurement = {
  id: number;
  measuredOn: string;
  weightKilograms: number | null;
  bodyFatPercent: number | null;
  waistCentimetres: number | null;
  hipCentimetres: number | null;
  chestCentimetres: number | null;
  notes: string | null;
};
