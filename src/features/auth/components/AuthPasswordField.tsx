import type { ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { Control, FieldValues, Path } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type AuthPasswordFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: ReactNode
  placeholder: string
  autoComplete?: string
  showPassword: boolean
  onToggle: () => void
  errorText?: string
}

export function AuthPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoComplete,
  showPassword,
  onToggle,
  errorText,
}: Readonly<AuthPasswordFieldProps<T>>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder={placeholder}
                type={showPassword ? "text" : "password"}
                autoComplete={autoComplete}
                {...field}
              />
              <button
                type="button"
                onClick={onToggle}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormControl>
          {errorText ? <FormMessage>{errorText}</FormMessage> : <FormMessage />}
        </FormItem>
      )}
    />
  )
}
