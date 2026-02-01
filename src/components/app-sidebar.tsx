import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AccountSection } from "./app-sidebar/AccountSection"
import { NavigationSection } from "./app-sidebar/NavigationSection"
import { SidebarBrand } from "./app-sidebar/SidebarBrand"
import { LogoutSection } from "./app-sidebar/LogoutSection"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarBrand />
        <Separator className="-mt-2" />
        <NavigationSection />
        <AccountSection />
      </SidebarContent>

      <SidebarFooter>
        <LogoutSection />
      </SidebarFooter>
    </Sidebar>
  )
}
