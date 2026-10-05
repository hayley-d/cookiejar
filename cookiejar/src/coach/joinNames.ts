export function joinNames(names: readonly string[], conjunction: 'and' | 'or'): string {
  if (names.length <= 1) {
    return names.join('');
  }
  return `${names.slice(0, -1).join(', ')} ${conjunction} ${names[names.length - 1]}`;
}
