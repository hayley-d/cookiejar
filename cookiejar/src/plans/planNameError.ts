export function planNameError(name: string) {
  return name.trim().length === 0 ? 'Give your plan a name' : null;
}
