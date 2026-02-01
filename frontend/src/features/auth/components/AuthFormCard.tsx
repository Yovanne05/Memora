import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type AuthFormCardProps = {
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
}

export function AuthFormCard({
  title,
  description,
  footer,
  children,
}: Readonly<AuthFormCardProps>) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="justify-between text-sm text-muted-foreground">{footer}</CardFooter>
    </Card>
  )
}
