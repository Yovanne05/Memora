import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function AppHeader() {
    return (
        <header className="h-16 border-b flex items-center px-4 gap-4 bg-background">
            <SidebarTrigger />

            <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search notes, collections..."
                    className="pl-10 rounded-xl bg-muted/40 border border-muted-foreground/20"
                />
            </div>
        </header>
    )
}
