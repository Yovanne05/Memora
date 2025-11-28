import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ModeToggle } from "./mode-toggle"

export function AppHeader() {
    return (
        <header className="h-16 border-b flex items-center px-4 gap-4 bg-background">
            <SidebarTrigger />

            <div className="relative w-full max-w-full md:max-w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                <Input
                    placeholder="Search notes, collections..."
                    className="pl-10"
                />
            </div>

            <div className="ml-auto">
                <ModeToggle />
            </div>
        </header>
    )
}


