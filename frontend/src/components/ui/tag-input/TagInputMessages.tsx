type TagInputMessagesProps = {
  error?: string
  maxTags: number
  count: number
}

export function TagInputMessages({
  error,
  maxTags,
  count,
}: Readonly<TagInputMessagesProps>) {
  return (
    <>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {count >= maxTags && (
        <p className="text-sm text-muted-foreground">
          Limite de {maxTags} tags atteinte
        </p>
      )}
    </>
  )
}
