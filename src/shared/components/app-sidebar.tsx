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
} from "lucide-react"

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

export function AppSidebar() {
    const navigationItems = [
        { title: "Dashboard", icon: LayoutDashboard, url: "#" },
        { title: "Collections", icon: FolderKanban, url: "#" },
        { title: "Knowledge Graph", icon: Network, url: "#" },
        { title: "Search", icon: Search, url: "#" },
        { title: "Revision", icon: GraduationCap, url: "#" },
        { title: "Journal & Stats", icon: History, url: "#" },
    ]

    const accountItems = [
        { title: "Settings", icon: SettingsIcon, url: "#" },
    ]

    return (
        <Sidebar>
            <SidebarContent>

                {/* HEADER */}
                <div className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        <div>
                            <h1 className="font-semibold text-lg leading-tight">Memora</h1>
                            <p className="text-sm text-muted-foreground -mt-1">
                                Knowledge base
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* NAVIGATION */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* ACCOUNT */}
                <SidebarGroup>
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {accountItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </a>
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
                        <SidebarMenuButton asChild>
                            <a href="#">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
