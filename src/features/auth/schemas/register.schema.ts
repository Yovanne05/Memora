import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email invalide.'),
  username: z
    .string()
    .min(3, "Nom d'utilisateur trop court.")
    .max(50, "Nom d'utilisateur trop long."),
  password: z
    .string()
    .min(12, '12 caractères minimum')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/\d/, 'Au moins 1 chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins 1 caractère spécial'),
})

export type RegisterValues = z.infer<typeof registerSchema>
