const afternoonStartHour = 12;
const eveningStartHour = 17;

function chooseTimeOfDayGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour < afternoonStartHour) {
    return 'Good morning';
  }
  if (hour < eveningStartHour) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function chooseGreeting(now: Date, displayName: string | null): string {
  const trimmedName = displayName?.trim() ?? '';
  if (trimmedName === '') {
    return 'Hi there';
  }
  return `${chooseTimeOfDayGreeting(now)}, ${trimmedName}`;
}
