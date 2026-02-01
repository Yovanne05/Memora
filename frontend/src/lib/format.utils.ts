const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

const longDateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
})

export function formatShortDate(dateString: string): string {
  return shortDateFormatter.format(new Date(dateString))
}

export function formatLongDateTime(dateString: string): string {
  return longDateTimeFormatter.format(new Date(dateString))
}

export function formatTime(dateString: string): string {
  return timeFormatter.format(new Date(dateString))
}

export type Visibility = "private" | "public"

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Publique",
  private: "Privée",
}

export const VISIBILITY_BADGE_CLASSES: Record<Visibility, string> = {
  public: "border-emerald-400/50 bg-emerald-50 text-emerald-700",
  private: "border-border bg-muted text-foreground",
}