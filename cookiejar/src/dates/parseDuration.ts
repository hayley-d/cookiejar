const plainSecondsPattern = /^\d+$/;
const clockPattern = /^(\d+):([0-5]\d)$/;
const unitsPattern = /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?$/;

export function parseDuration(text: string): number | null {
  const trimmedText = text.trim().toLowerCase();
  if (trimmedText.length === 0) {
    return null;
  }

  if (plainSecondsPattern.test(trimmedText)) {
    return Number(trimmedText);
  }

  const clockMatch = clockPattern.exec(trimmedText);
  if (clockMatch) {
    return Number(clockMatch[1]) * 60 + Number(clockMatch[2]);
  }

  const unitsMatch = unitsPattern.exec(trimmedText);
  if (unitsMatch) {
    const [, hours = '0', minutes = '0', seconds = '0'] = unitsMatch;
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }

  return null;
}
