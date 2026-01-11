export const REPORT_REASONS = {
  illegal_content: 'Contenu illégal',
  spam: 'Spam ou publicité',
  harassment: 'Harcèlement',
  inappropriate: 'Contenu inapproprié',
  copyright: "Violation de droits d'auteur",
  other: 'Autre',
} as const

export type ReportReason = keyof typeof REPORT_REASONS

export const REPORT_REASON_OPTIONS = Object.entries(REPORT_REASONS).map(
  ([value, label]) => ({
    value: value as ReportReason,
    label,
  })
)
