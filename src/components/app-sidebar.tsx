import {
  BookOpen,
  LayoutDashboard,
  LayoutGrid,
  Network,
  Search,
  GraduationCap,
  History,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react"

import { Link, useRouter } from "@tanstack/react-router"
import { toast } from "sonner"
import { useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function AppSidebar() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navigationItems = [
    { title: "Tableau de bord", icon: LayoutDashboard, url: "/app/dashboard" },
    { title: "Workspace", icon: LayoutGrid, url: "/app/workspace" },
    { title: "Graphe de connaissances", icon: Network, url: "/app/visualization" },
    { title: "Recherche", icon: Search, url: "/app/search" },
    { title: "Révision", icon: GraduationCap, url: "/app/revision" },
    { title: "Statistiques", icon: History, url: "/app/statistics" },
  ]

  const accountItems = [
    { title: "Paramètres", icon: SettingsIcon, url: "/app/settings" },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success("Déconnexion effectuée.")
      router.navigate({ to: "/auth/login", search: { redirect: "/app/dashboard" } })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de vous déconnecter."
      toast.error(message)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <BookOpen className="h-5 w-5" />
            <div>
              <h1 className="font-semibold text-lg leading-tight">Memora</h1>
              <p className="text-sm text-muted-foreground -mt-1">
                Base de connaissances
              </p>
            </div>
          </div>
        </div>

        <Separator className="-mt-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={`${item.title}-${item.url ?? "disabled"}`}>
                  <SidebarMenuButton asChild>
                    {item.url ? (
                      <Link to={item.url} className="inline-flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 opacity-50 cursor-not-allowed"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="inline-flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
