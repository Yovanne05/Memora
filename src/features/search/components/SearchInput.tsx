import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onClear?: () => void
  readonly placeholder?: string
  readonly className?: string
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Rechercher...',
  className,
}: Readonly<SearchInputProps>) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onChange('')
            onClear?.()
          }}
          className="absolute right-1 h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
