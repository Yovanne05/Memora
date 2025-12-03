import { Button } from "@/components/ui/button"

export function NotesPagination({
  page,
  maxPage,
  setPage,
}: {
  page: number
  maxPage: number
  setPage: (p: number) => void
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      <Button
        variant="outline"
        disabled={page === 0}
        onClick={() => setPage(Math.max(0, page - 1))}
      >
        Précédent
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {page + 1} / {maxPage + 1}
      </span>

      <Button
        variant="outline"
        disabled={page >= maxPage}
        onClick={() => setPage(Math.min(maxPage, page + 1))}
      >
        Suivant
      </Button>
    </div>
  )
}

