export type HealthAccessStatusDescription = {
  caption: string;
  headline: string;
  detail: string;
};

export function describeHealthAccessStatus(hasRequestedAuthorization: boolean | null): HealthAccessStatusDescription {
  if (hasRequestedAuthorization === null) {
    return { caption: 'Checking status', headline: 'Checking status', detail: '' };
  }

  if (hasRequestedAuthorization) {
    return {
      caption: 'Access requested',
      headline: 'Access requested',
      detail:
        "Nuggie's Gym has asked to read your Health data. Apple does not tell apps which data you allowed. " +
        "To check or change it, open Settings, then Health, then Data Access & Devices, then Nuggie's Gym. " +
        "You can also use the Health app: tap your profile picture, then Apps, then Nuggie's Gym.",
    };
  }

  return {
    caption: 'Not connected',
    headline: 'Not connected',
    detail:
      "Nuggie's Gym has not asked for access yet. Request access to see your steps, sleep, resting heart rate and " +
      'workouts. Everything stays on your phone.',
  };
}
