const collectionDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatCollectionDate(dateString: string): string {
  return collectionDateFormatter.format(new Date(dateString))
}

export function getVisibilityLabel(visibility: "private" | "public"): string {
  return visibility === "public" ? "Publique" : "Privée"
}

export function getVisibilityBadgeClasses(visibility: "private" | "public"): string {
  return visibility === "public"
    ? "border-emerald-400/50 bg-emerald-50 text-emerald-700"
    : "border-border bg-muted text-foreground"
}
