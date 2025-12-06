interface ErrorStateProps {
  message?: string;
}

export function ErrorState({
  message = "Une erreur est survenue.",
}: ErrorStateProps) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-destructive">
      {message}
    </div>
  );
}
