import { GraduationCap } from "lucide-react";

interface FlashcardsHeaderProps {
  title?: string;
  description?: string;
}

export function FlashcardsHeader({ title = "Flashcards", description }: Readonly<FlashcardsHeaderProps>) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
        <GraduationCap className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
