import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "@tanstack/react-router"

type BreadcrumbItemData = {
  label: string
  href?: string
}

type WorkspaceBreadcrumbProps = {
  items: BreadcrumbItemData[]
}

export function WorkspaceBreadcrumb({ items }: Readonly<WorkspaceBreadcrumbProps>) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="contents">
            <BreadcrumbItem>
              {item.href ? (
                <Link to={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
