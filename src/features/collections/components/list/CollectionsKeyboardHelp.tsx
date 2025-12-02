import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const shortcuts = [
  { keys: ["Ctrl", "N"], description: "Créer une nouvelle collection" },
  { keys: ["Ctrl", "F"], description: "Rechercher dans les collections" },
  { keys: ["Ctrl", "K"], description: "Afficher/masquer les filtres" },
  { keys: ["Ctrl", "Shift", "S"], description: "Activer le mode sélection" },
]

export function CollectionsKeyboardHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Raccourcis clavier">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raccourcis clavier</DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <Badge key={keyIndex} variant="secondary" className="font-mono text-xs">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Note : Utilisez Cmd au lieu de Ctrl sur Mac
        </div>
      </DialogContent>
    </Dialog>
  )
}
