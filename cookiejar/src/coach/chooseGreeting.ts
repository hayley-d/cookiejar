const afternoonStartHour = 12;
const eveningStartHour = 17;

function chooseTimeOfDayWord(now: Date): string {
  const hour = now.getHours();
  if (hour < afternoonStartHour) {
    return 'Morning';
  }
  if (hour < eveningStartHour) {
    return 'Afternoon';
  }
  return 'Evening';
}

export function chooseGreeting(now: Date, displayName: string | null): string {
  const trimmedName = displayName?.trim() ?? '';
  const timeOfDayWord = chooseTimeOfDayWord(now);
  return trimmedName === '' ? `${timeOfDayWord}!` : `${timeOfDayWord} ${trimmedName}!`;
}
