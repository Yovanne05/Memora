import * as React from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SIDEBAR_WIDTH_MOBILE } from "./constants"

type SidebarMobileProps = React.ComponentProps<"div"> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  side: "left" | "right"
}

export function SidebarMobile({
  open,
  onOpenChange,
  side,
  children,
  ...props
}: SidebarMobileProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} {...props}>
      <SheetContent
        data-sidebar="sidebar"
        data-slot="sidebar"
        data-mobile="true"
        className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
        side={side}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Displays the mobile sidebar.</SheetDescription>
        </SheetHeader>
        <div className="flex h-full w-full flex-col">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
