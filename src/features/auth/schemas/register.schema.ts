import { z } from "zod"

export const registerSchema = z.object({
  displayName: z.string().min(2, "Indiquez votre nom ou pseudo."),
  email: z.email("Email invalide."),
  username: z.string().min(3, "Nom d'utilisateur trop court.").max(50, "Nom d'utilisateur trop long."),
  password: z
    .string()
    .min(12, "12 caractères minimum")
    .regex(/[A-Z]/, "Au moins 1 majuscule")
    .regex(/[0-9]/, "Au moins 1 chiffre")
    .regex(/[^A-Za-z0-9]/, "Au moins 1 caractère spécial"),
})

export type RegisterValues = z.infer<typeof registerSchema>
