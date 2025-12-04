import { X, Calendar, Eye, EyeOff, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Note } from "../models/note.model";
import { cn } from "@/lib/utils";
import { useResizable } from "@/hooks/useResizable";

interface NoteSidebarProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  relatedNotes?: Note[];
  onNoteClick?: (noteId: string) => void;
}

export function NoteSidebar({
  note,
  open,
  onClose,
  relatedNotes = [],
  onNoteClick,
}: NoteSidebarProps) {
  const { width, isResizing, handleMouseDown, resizeRef } = useResizable({
    minWidth: 320,
    maxWidth: window.innerWidth * 0.8,
    defaultWidth: 480,
    storageKey: "note-sidebar-width",
  });

  if (!note) return null;

  const formattedCreatedAt = new Date(note.createdAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedUpdatedAt = new Date(note.updatedAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <aside
        ref={resizeRef}
        style={{ width: `${width}px` }}
        className={cn(
          "fixed top-0 right-0 h-full bg-background border-l shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full",
          isResizing && "transition-none"
        )}
      >
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/50 transition-colors group",
            isResizing && "bg-primary"
          )}
        >
          <div className="absolute left-0 top-0 h-full w-4 -translate-x-1.5" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Détails de la note</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {relatedNotes.length > 0 && (
            <div className="px-6 py-4 bg-muted/30">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Notes liées ({relatedNotes.length})
              </h3>
              <div className="space-y-2">
                {relatedNotes.map((relatedNote) => (
                  <button
                    key={relatedNote.id}
                    onClick={() => onNoteClick?.(relatedNote.id)}
                    className="w-full text-left p-3 rounded-lg border bg-background hover:bg-accent hover:border-accent-foreground/20 transition-colors group flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {relatedNote.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {relatedNote.content}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold leading-tight mb-3">
                {note.title}
              </h1>
              <Badge
                variant={note.visibility === "public" ? "default" : "secondary"}
                className="flex items-center gap-1 w-fit"
              >
                {note.visibility === "public" ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
                {note.visibility === "public" ? "Publique" : "Privée"}
              </Badge>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Contenu
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content || (
                    <span className="text-muted-foreground italic">
                      Aucun contenu
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Informations
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Créée le {formattedCreatedAt}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Modifiée le {formattedUpdatedAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
