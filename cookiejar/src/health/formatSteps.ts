export const missingHealthValue = '—';

function groupThousands(wholeNumber: number): string {
  return String(wholeNumber).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatSteps(steps: number | null): string {
  if (steps === null) {
    return missingHealthValue;
  }
  return groupThousands(Math.max(0, Math.round(steps)));
}
