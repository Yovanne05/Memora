export const REPORT_REASONS = {
  illegal_content: 'Contenu illégal',
  shocking_or_inappropriate: 'Contenu choquant ou inapproprié',
  harassment_or_abuse: 'Harcèlement ou abus',
  rights_violation: 'Violation de droits',
  spam_or_abuse: 'Spam ou abus',
  technical_issue: 'Problème technique',
  other: 'Autre',
} as const

export type ReportReason = keyof typeof REPORT_REASONS

export const REPORT_REASON_OPTIONS = Object.entries(REPORT_REASONS).map(
  ([value, label]) => ({
    value: value as ReportReason,
    label,
  })
)
