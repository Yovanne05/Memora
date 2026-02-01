import type { ReactNode } from "react"

type AuthPageLayoutProps = {
  backgroundClassName: string
  intro: ReactNode
  children: ReactNode
}

export function AuthPageLayout({
  backgroundClassName,
  intro,
  children,
}: Readonly<AuthPageLayoutProps>) {
  return (
    <div className={`min-h-screen ${backgroundClassName}`}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-center">
        {intro}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
