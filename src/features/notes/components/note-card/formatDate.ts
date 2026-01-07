export function formatNoteDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}
