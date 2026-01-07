import type { ReactNode } from "react"
import { CardContent } from "@/components/ui/card"

type ResourceCardContentProps = {
  badges?: ReactNode
  metadata?: ReactNode
  footer?: ReactNode
  compact: boolean
}

export function ResourceCardContent({
  badges,
  metadata,
  footer,
  compact,
}: Readonly<ResourceCardContentProps>) {
  return (
    <CardContent className={`space-y-3 ${compact ? "pt-0 pb-2" : "pt-0"}`}>
      {badges && <div className="flex items-center gap-2">{badges}</div>}
      {metadata && <div className="flex flex-wrap items-center gap-3">{metadata}</div>}
      {footer}
    </CardContent>
  )
}
