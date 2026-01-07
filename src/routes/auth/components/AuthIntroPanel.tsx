import { AuthHighlight } from "./AuthHighlight"

type HighlightItem = {
  title: string
  description: string
}

type AuthIntroPanelProps = {
  kicker: string
  title: string
  description: string
  highlights: HighlightItem[]
}

export function AuthIntroPanel({
  kicker,
  title,
  description,
  highlights,
}: Readonly<AuthIntroPanelProps>) {
  return (
    <div className="hidden flex-1 flex-col gap-6 rounded-2xl border bg-background/60 p-10 shadow-lg backdrop-blur lg:flex">
      <div className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
        {kicker}
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold leading-tight">{title}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <AuthHighlight key={item.title} title={item.title} description={item.description} />
        ))}
      </div>
    </div>
  )
}
