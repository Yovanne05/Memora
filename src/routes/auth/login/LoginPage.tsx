import { AuthPageLayout } from "../components/AuthPageLayout"
import { LoginForm } from "./LoginForm"
import { LoginIntro } from "./LoginIntro"
import { useLoginForm } from "./useLoginForm"

type LoginPageProps = {
  redirectTo: string
}

export function LoginPage({ redirectTo }: Readonly<LoginPageProps>) {
  const { form, formError, showPassword, setShowPassword, onSubmit, isLoggingIn } =
    useLoginForm(redirectTo)

  return (
    <AuthPageLayout
      backgroundClassName="bg-linear-to-br from-amber-500/15 via-rose-500/10 to-sky-600/15"
      intro={<LoginIntro />}
    >
      <LoginForm
        form={form}
        formError={formError}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onSubmit={onSubmit}
        isLoggingIn={isLoggingIn}
        redirectTo={redirectTo}
      />
    </AuthPageLayout>
  )
}
