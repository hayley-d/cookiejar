export function notesToStore(notes: string) {
  const trimmedNotes = notes.trim();
  return trimmedNotes.length === 0 ? null : trimmedNotes;
}
