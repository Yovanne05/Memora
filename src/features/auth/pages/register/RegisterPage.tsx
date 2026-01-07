import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout"
import { RegisterForm } from "./RegisterForm"
import { RegisterIntro } from "./RegisterIntro"
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm"

type RegisterPageProps = {
  redirectTo: string
}

export function RegisterPage({ redirectTo }: Readonly<RegisterPageProps>) {
  const { form, formError, showPassword, setShowPassword, onSubmit, isRegistering } =
    useRegisterForm(redirectTo)

  return (
    <AuthPageLayout
      backgroundClassName="bg-linear-to-br from-emerald-500/15 via-amber-400/10 to-sky-600/15"
      intro={<RegisterIntro />}
    >
      <RegisterForm
        form={form}
        formError={formError}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onSubmit={onSubmit}
        isRegistering={isRegistering}
        redirectTo={redirectTo}
      />
    </AuthPageLayout>
  )
}

