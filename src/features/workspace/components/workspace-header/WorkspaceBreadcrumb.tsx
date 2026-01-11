import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'

type BreadcrumbItemData = {
  label: string
  href?: string
}

type WorkspaceBreadcrumbProps = {
  items: BreadcrumbItemData[]
}

export function WorkspaceBreadcrumb({
  items,
}: Readonly<WorkspaceBreadcrumbProps>) {
  if (items.length === 0) {
    return null
  }

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-wrap">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="contents">
            <BreadcrumbItem className="max-w-[200px] truncate">
              {item.href ? (
                <Link
                  to={item.href}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <BreadcrumbPage className="truncate">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
