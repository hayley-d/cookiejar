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
        'Cookiejar has asked to read your Health data. Apple does not tell apps which data you allowed. ' +
        'To check or change it, open Settings, then Health, then Data Access & Devices, then Cookiejar. ' +
        'You can also use the Health app: tap your profile picture, then Apps, then Cookiejar.',
    };
  }

  return {
    caption: 'Not connected',
    headline: 'Not connected',
    detail:
      'Cookiejar has not asked for access yet. Request access to see your steps, sleep, resting heart rate and ' +
      'workouts. Everything stays on your phone.',
  };
}
