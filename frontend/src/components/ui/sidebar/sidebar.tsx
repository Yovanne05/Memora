import * as React from "react"

import { cn } from "@/lib/utils"
import { useSidebar } from "./context"
import { SidebarDesktop } from "./desktop"
import { SidebarMobile } from "./mobile"
import { SIDEBAR_WIDTH } from "./constants"

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <SidebarMobile
        open={openMobile}
        onOpenChange={setOpenMobile}
        side={side}
        {...props}
      >
        {children}
      </SidebarMobile>
    )
  }

  return (
    <SidebarDesktop
      side={side}
      variant={variant}
      collapsible={collapsible}
      state={state}
      className={className}
      {...props}
    >
      {children}
    </SidebarDesktop>
  )
}
