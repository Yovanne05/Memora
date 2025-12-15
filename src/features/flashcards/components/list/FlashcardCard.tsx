import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarClock, Copy, GraduationCap, MoreHorizontal } from "lucide-react";
import type { Flashcard } from "../../models/flashcard.model";

interface FlashcardCardProps {
  flashcard: Flashcard;
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (flashcard: Flashcard) => void;
  onDuplicate?: (flashcard: Flashcard) => void;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

export function FlashcardCard({ flashcard, onEdit, onDelete, onDuplicate }: Readonly<FlashcardCardProps>) {
  const correctAnswersCount = flashcard.answers.filter((a) => a.isCorrect).length;
  const totalAnswers = flashcard.answers.length;

  return (
    <Link
      to="/app/flashcards/$id"
      params={{ id: flashcard.id }}
      className="block h-full"
      aria-label={`Ouvrir la flashcard ${flashcard.question}`}
    >
      <Card className="group flex h-full flex-col justify-between border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-base leading-tight line-clamp-2">
                {flashcard.question}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalAnswers} réponse{totalAnswers > 1 ? "s" : ""} • {correctAnswersCount} correcte{correctAnswersCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {(onEdit || onDelete || onDuplicate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(flashcard);
                    }}
                  >
                    Modifier
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onDuplicate(flashcard);
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Dupliquer
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(flashcard);
                    }}
                  >
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                Créée le {formatDate(flashcard.createdAt)}
              </span>
              {flashcard.createdAt.getTime() !== flashcard.updatedAt.getTime() && (
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Modifiée le {formatDate(flashcard.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
