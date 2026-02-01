type AuthHighlightProps = {
  title: string
  description: string
}

export function AuthHighlight({ title, description }: Readonly<AuthHighlightProps>) {
  return (
    <div className="rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur">
      <div className="text-sm font-semibold">{title}</div>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}
