import { PaginationComponent } from "@/components/ui/pagination-component"

export function NotesPagination({
  page,
  maxPage,
  setPage,
}: Readonly<{
  page: number
  maxPage: number
  setPage: (p: number) => void
}>) {
  return <PaginationComponent page={page} maxPage={maxPage} setPage={setPage} />
}
