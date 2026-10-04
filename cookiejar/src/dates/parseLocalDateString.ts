const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDateString(text: string): Date {
  const match = localDatePattern.exec(text);
  if (!match) {
    throw new Error(`Invalid local date: ${text}`);
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);

  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
    throw new Error(`Invalid local date: ${text}`);
  }

  return date;
}
