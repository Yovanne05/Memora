import { type MouseEvent } from "react"
import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { PaginationPageItems } from "./pagination-component/PageItems"
import { usePaginationPages } from "./pagination-component/usePaginationPages"

export function PaginationComponent({
  page,
  maxPage,
  setPage,
}: Readonly<{
  page: number
  maxPage: number
  setPage: (p: number) => void
}>) {
  const totalPages = maxPage + 1
  const currentPage = page + 1
  const pages = usePaginationPages(currentPage, totalPages)

  const goToPage = (target: number) => {
    const next = Math.min(maxPage, Math.max(0, target))
    setPage(next)
  }

  const handleNavigate =
    (target: number) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      goToPage(target)
    }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 0}
            className={cn(
              "w-auto border-none bg-transparent px-3 text-foreground hover:bg-accent hover:text-accent-foreground",
              page === 0 && "pointer-events-none opacity-50"
            )}
            onClick={handleNavigate(page - 1)}
          >
            Précédent
          </PaginationPrevious>
        </PaginationItem>

        <PaginationPageItems
          pages={pages}
          currentPage={currentPage}
          onSelect={goToPage}
        />

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page >= maxPage}
            className={cn(
              "w-auto border-none bg-transparent px-3 text-foreground hover:bg-accent hover:text-accent-foreground",
              page >= maxPage && "pointer-events-none opacity-50"
            )}
            onClick={handleNavigate(page + 1)}
          >
            Suivant
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
