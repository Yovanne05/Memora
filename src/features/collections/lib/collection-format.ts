const collectionDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatCollectionDate(date: string): string {
  return collectionDateFormatter.format(new Date(date))
}
