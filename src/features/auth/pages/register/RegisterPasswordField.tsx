import { Info } from 'lucide-react'
import type { Control, FieldErrors } from 'react-hook-form'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AuthPasswordField } from '@/features/auth/components/AuthPasswordField'
import type { RegisterValues } from '@/features/auth/schemas/register.schema'

type RegisterPasswordFieldProps = {
  control: Control<RegisterValues>
  errors: FieldErrors<RegisterValues>
  showPassword: boolean
  onTogglePassword: () => void
}

export function RegisterPasswordField({
  control,
  errors,
  showPassword,
  onTogglePassword,
}: Readonly<RegisterPasswordFieldProps>) {
  return (
    <AuthPasswordField
      control={control}
      name="password"
      label={
        <span className="flex items-center gap-2">
          <span>Mot de passe</span>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Règles du mot de passe"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="start"
                className="max-w-xs text-sm"
              >
                12 caractères minimum, avec au moins 1 majuscule, 1 chiffre et 1
                caractère spécial.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      }
      placeholder="********"
      autoComplete="new-password"
      showPassword={showPassword}
      onToggle={onTogglePassword}
      errorText={errors.password ? 'Champ invalide.' : undefined}
    />
  )
}
