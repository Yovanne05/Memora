import {
    BookOpen,
    LayoutDashboard,
    FolderKanban,
    Network,
    Search,
    GraduationCap,
    History,
    Settings as SettingsIcon,
    LogOut,
    FileText,
    PanelLeft,
} from "lucide-react"

import { Link } from "@tanstack/react-router"

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
    useSidebar,
} from "@/components/ui/sidebar"

import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "./mode-toggle"

export function AppSidebar() {
    const { toggleSidebar } = useSidebar()

    const navigationItems = [
        { title: "Tableau de bord", icon: LayoutDashboard, url: "/app/dashboard" },
        { title: "Notes", icon: FileText, url: "/app/notes" },
        { title: "Collections", icon: FolderKanban, url: "/app/collections" },
        { title: "Graphe de connaissances", icon: Network, url: "/app/visualization" },
        { title: "Recherche", icon: Search, url: "/app/search" },
        { title: "Révision", icon: GraduationCap, url: "/app/revision" },
        { title: "Journal et stats", icon: History, url: "#" },
    ]

    const accountItems = [
        { title: "Paramètres", icon: SettingsIcon, url: "/app/settings" },
    ]

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

                <Separator className="-mt-2"/>

                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                                    <SidebarMenuButton asChild>
                                        {item.url && item.url.startsWith("/") ? (
                                            <Link to={item.url} className="inline-flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        ) : (
                                            <a href={item.url} className="inline-flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
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
                                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                                    <SidebarMenuButton asChild>
                                        {item.url && item.url.startsWith("/") ? (
                                            <Link to={item.url} className="inline-flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        ) : (
                                            <a href={item.url} className="inline-flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        )}
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
                        <div className="flex items-center justify-between px-2 py-2">
                            <SidebarMenuButton onClick={toggleSidebar} className="flex items-center gap-2">
                                <PanelLeft className="h-4 w-4" />
                                <span>Réduire</span>
                            </SidebarMenuButton>
                            <div className="flex items-center gap-2">
                                <ModeToggle />
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="#" className="inline-flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                <span>Déconnexion</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
