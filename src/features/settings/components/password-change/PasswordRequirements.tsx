import { memo } from 'react'

export const PasswordRequirements = memo(function PasswordRequirements() {
  return (
    <div className="rounded-lg bg-muted p-4 space-y-2">
      <p className="text-sm font-medium">Exigences du mot de passe :</p>
      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
        <li>Au moins 12 caractères</li>
        <li>Au moins une lettre majuscule</li>
        <li>Au moins une lettre minuscule</li>
        <li>Au moins un chiffre</li>
        <li>Au moins un caractère spécial (!@#$%^&*...)</li>
      </ul>
    </div>
  )
})
