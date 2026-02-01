import { z } from 'zod'
import { userDtoSchema } from '@/features/users/dto/user.dto'

export const loginDtoSchema = z.object({
  identifier: z.string(),
  password: z.string(),
})

export const registerDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  username: z.string().min(1),
})

export const authUserDtoSchema = userDtoSchema

export const authResponseDtoSchema = z.object({
  access_token: z.string(),
  user: authUserDtoSchema,
})

export const authMeResponseDtoSchema = z.object({
  user: authUserDtoSchema,
})

export type LoginDto = z.infer<typeof loginDtoSchema>
export type RegisterDto = z.infer<typeof registerDtoSchema>
export type AuthUserDto = z.infer<typeof authUserDtoSchema>
export type AuthResponseDto = z.infer<typeof authResponseDtoSchema>
export type AuthMeResponseDto = z.infer<typeof authMeResponseDtoSchema>
