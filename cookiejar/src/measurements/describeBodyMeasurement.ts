import type { BodyMeasurement } from '@/types/BodyMeasurement';

export type BodyMeasurementDescription = {
  title: string;
  detail: string | null;
};

export function describeBodyMeasurement(measurement: BodyMeasurement): BodyMeasurementDescription {
  const details: string[] = [];
  if (measurement.bodyFatPercent !== null) {
    details.push(`${measurement.bodyFatPercent} % body fat`);
  }
  if (measurement.waistCentimetres !== null) {
    details.push(`waist ${measurement.waistCentimetres} cm`);
  }
  if (measurement.hipCentimetres !== null) {
    details.push(`hips ${measurement.hipCentimetres} cm`);
  }
  if (measurement.chestCentimetres !== null) {
    details.push(`chest ${measurement.chestCentimetres} cm`);
  }
  if (measurement.notes !== null) {
    details.push(measurement.notes);
  }

  if (measurement.weightKilograms !== null) {
    return { title: `${measurement.weightKilograms} kg`, detail: details.length > 0 ? details.join(' · ') : null };
  }
  const [firstDetail, ...remainingDetails] = details;
  return {
    title: firstDetail ?? 'Measurement',
    detail: remainingDetails.length > 0 ? remainingDetails.join(' · ') : null,
  };
}
