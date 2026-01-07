import { z } from "zod"

export const registerSchema = z.object({
  displayName: z.string().min(2, "Indiquez votre nom ou pseudo."),
  email: z.email("Email invalide."),
  username: z.string().min(3, "Nom d'utilisateur trop court.").max(50, "Nom d'utilisateur trop long."),
  password: z.string().min(8, "Au moins 8 caractères sont requis."),
})

export type RegisterValues = z.infer<typeof registerSchema>
