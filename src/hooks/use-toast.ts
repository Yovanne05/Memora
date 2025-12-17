import { toast as sonnerToast } from "sonner"

export interface Toast {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant }: Toast) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Erreur", {
        description,
      })
    } else {
      sonnerToast.success(title || "Succès", {
        description,
      })
    }
  }

  return { toast }
}
