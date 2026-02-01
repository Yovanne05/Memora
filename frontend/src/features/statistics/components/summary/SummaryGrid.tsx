import type { ReactNode } from "react"

type Props = {
  readonly children: ReactNode
}

export function SummaryGrid({ children }: Readonly<Props>) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {children}
    </section>
  )
}
