import { useMemo, type MouseEvent } from "react"
import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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

  const pages = useMemo(() => {
    const base = new Set<number>()
    base.add(1)
    base.add(totalPages)
    base.add(currentPage)
    base.add(currentPage - 1)
    base.add(currentPage + 1)

    if (currentPage <= 2) {
      base.add(2)
      base.add(3)
    }

    if (currentPage >= totalPages - 1) {
      base.add(totalPages - 1)
      base.add(totalPages - 2)
    }

    const orderedPages = Array.from(base)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b)

    const result: Array<number | "ellipsis"> = []
    for (const value of orderedPages) {
      const previous = result[result.length - 1]
      if (typeof previous === "number" && value - previous > 1) {
        result.push("ellipsis")
      }
      result.push(value)
    }

    return result
  }, [currentPage, totalPages])

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

  const pageElements = (() => {
    let ellipsisIndex = 0

    return pages.map((value) => {
      if (value === "ellipsis") {
        const key = `ellipsis-${ellipsisIndex}`
        ellipsisIndex += 1

        return (
          <PaginationItem key={key}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      return (
        <PaginationItem key={value}>
          <PaginationLink href="#" isActive={value === currentPage} onClick={handleNavigate(value - 1)}>
            {value}
          </PaginationLink>
        </PaginationItem>
      )
    })
  })()

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

        {pageElements}

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
