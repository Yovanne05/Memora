import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PaginationLink } from "./link"

export const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Aller à la page précédente"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    {children ?? <span>Précédent</span>}
  </PaginationLink>
))

PaginationPrevious.displayName = "PaginationPrevious"

export const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>(({ className, children, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Aller à la page suivante"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    {children ?? <span>Suivant</span>}
    <ChevronRight className="h-4 w-4" aria-hidden="true" />
  </PaginationLink>
))

PaginationNext.displayName = "PaginationNext"
