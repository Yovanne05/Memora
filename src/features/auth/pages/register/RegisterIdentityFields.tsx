import type { Control, FieldErrors } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { RegisterValues } from '@/features/auth/schemas/register.schema'

type RegisterIdentityFieldsProps = {
  control: Control<RegisterValues>
  errors: FieldErrors<RegisterValues>
}

export function RegisterIdentityFields({
  control,
  errors,
}: Readonly<RegisterIdentityFieldsProps>) {
  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="vous@example.com"
                type="email"
                autoComplete="email"
                {...field}
              />
            </FormControl>
            {errors.email ? <FormMessage>Champ invalide.</FormMessage> : null}
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom d'utilisateur</FormLabel>
            <FormControl>
              <Input placeholder="janedoe" autoComplete="username" {...field} />
            </FormControl>
            {errors.username ? (
              <FormMessage>Champ invalide.</FormMessage>
            ) : null}
          </FormItem>
        )}
      />
    </>
  )
}
