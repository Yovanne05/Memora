import { type MouseEvent } from "react"
import {
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { type PageItem } from "./usePaginationPages"

type PaginationPageItemsProps = {
  pages: PageItem[]
  currentPage: number
  onSelect: (pageIndex: number) => void
}

export function PaginationPageItems({
  pages,
  currentPage,
  onSelect,
}: Readonly<PaginationPageItemsProps>) {
  let ellipsisIndex = 0

  const handleNavigate =
    (target: number) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      onSelect(target)
    }

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
        <PaginationLink
          href="#"
          isActive={value === currentPage}
          onClick={handleNavigate(value - 1)}
        >
          {value}
        </PaginationLink>
      </PaginationItem>
    )
  })
}
