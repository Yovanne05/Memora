import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, "Renseignez votre email ou nom d'utilisateur."),
  password: z.string().min(1, 'Le mot de passe est requis.'),
})

export type LoginValues = z.infer<typeof loginSchema>
