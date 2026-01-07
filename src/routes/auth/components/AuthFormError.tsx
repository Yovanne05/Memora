import { AlertTriangle } from "lucide-react"

type AuthFormErrorProps = {
  message: string
}

export function AuthFormError({ message }: Readonly<AuthFormErrorProps>) {
  return (
    <div className="mb-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p className="text-destructive/90">{message}</p>
      </div>
    </div>
  )
}
