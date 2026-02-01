import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"

export function AppHeader() {
    return (
        <header className="h-16 border-b flex items-center px-4 gap-4 bg-background">
            <SidebarTrigger />
            <div className="ml-auto">
                <ModeToggle />
            </div>
        </header>
    )
}


