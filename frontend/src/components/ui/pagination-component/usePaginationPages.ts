import { useMemo } from "react"

export type PageItem = number | "ellipsis"

export function usePaginationPages(currentPage: number, totalPages: number) {
  return useMemo<PageItem[]>(() => {
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
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b)

    const result: PageItem[] = []
    for (const value of orderedPages) {
      const previous = result[result.length - 1]
      if (typeof previous === "number" && value - previous > 1) {
        result.push("ellipsis")
      }
      result.push(value)
    }

    return result
  }, [currentPage, totalPages])
}
