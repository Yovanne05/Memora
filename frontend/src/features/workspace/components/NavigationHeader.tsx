import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface NavigationHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  onBack?: () => void
  backHref?: string
  actions?: React.ReactNode
  showBackButton?: boolean
}

export function NavigationHeader({
  title,
  description,
  onBack,
  backHref,
  actions,
  showBackButton = true,
}: Readonly<NavigationHeaderProps>) {
  const renderBackButton = () => {
    if (!showBackButton) return null

    const buttonContent = (
      <>
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Retour</span>
      </>
    )

    if (backHref) {
      return (
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to={backHref}>{buttonContent}</Link>
        </Button>
      )
    }

    if (onBack) {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          {buttonContent}
        </Button>
      )
    }

    return null
  }

  return (
    <header className="border-b bg-card">
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {renderBackButton()}

          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
            <h1 className="truncate text-xl font-semibold sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex w-full shrink-0 items-center sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
