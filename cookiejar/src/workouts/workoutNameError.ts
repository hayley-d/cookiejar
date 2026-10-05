export function workoutNameError(name: string) {
  return name.trim().length === 0 ? 'Give your workout a name' : null;
}
