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
  breadcrumbs,
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
      <div className="p-4">
        <div className="flex items-center gap-4">
          {renderBackButton()}

          <div className="min-w-0 flex-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="text-muted-foreground/50">/</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
            <h1 className="text-2xl font-semibold truncate">{title}</h1>
            {description && (
              <p className="mt-1 text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      </div>
    </header>
  )
}
