import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Eye, EyeOff } from "lucide-react";
import type { Note } from "../models/note.model";

interface NoteDetailsModalProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteDetailsModal({
  note,
  open,
  onOpenChange,
}: NoteDetailsModalProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold leading-tight">
            {note.title}
          </DialogTitle>
          <DialogDescription className="mt-2 flex items-center gap-2">
            <Badge
              variant={note.visibility === "public" ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {note.visibility === "public" ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {note.visibility === "public" ? "Publique" : "Privée"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Note Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Contenu
            </h3>
            <div className="prose prose-sm max-w-none">
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

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Créée le {formattedCreatedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Modifiée le {formattedUpdatedAt}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
