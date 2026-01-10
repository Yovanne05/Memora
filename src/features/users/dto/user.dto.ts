import { z } from 'zod'

export const userRoleSchema = z.enum(['client', 'admin', 'super_admin'])

export const userDtoSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string().min(3).max(50).nullable(),
  display_name: z.string().min(1).max(100).nullable(),
  color: z.string().nullable().optional(),
  role: userRoleSchema,
  created_at: z.iso.datetime(),
  last_login: z.iso.datetime().nullable().optional(),
})

export const usersListDtoSchema = z.union([
  z.array(userDtoSchema),
  z.object({
    items: z.array(userDtoSchema),
    total: z.number()
  })
])

export const userCreateDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(255),
  username: z.string().min(3).max(50).nullable().optional(),
  display_name: z.string().min(1).max(100).nullable().optional(),
  role: userRoleSchema.optional(),
})

export const userUpdateDtoSchema = z.object({
  email: z.email().optional(),
  password: z.string().min(8).max(255).optional(),
  username: z.string().min(3).max(50).nullable().optional(),
  display_name: z.string().min(1).max(100).nullable().optional(),
  role: userRoleSchema.optional(),
})

export type UserRoleDto = z.infer<typeof userRoleSchema>
export type UserDto = z.infer<typeof userDtoSchema>
export type UsersListDto = z.infer<typeof usersListDtoSchema>
export type UserCreateDto = z.infer<typeof userCreateDtoSchema>
export type UserUpdateDto = z.infer<typeof userUpdateDtoSchema>
