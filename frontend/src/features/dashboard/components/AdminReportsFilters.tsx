import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AdminReportsFiltersProps = {
  status: string
  target: string
  onStatusChange: (value: string) => void
  onTargetChange: (value: string) => void
}

export function AdminReportsFilters({
  status,
  target,
  onStatusChange,
  onTargetChange,
}: Readonly<AdminReportsFiltersProps>) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">En attente</SelectItem>
          <SelectItem value="in_progress">En cours</SelectItem>
          <SelectItem value="resolved">Résolu</SelectItem>
          <SelectItem value="rejected">Rejeté</SelectItem>
        </SelectContent>
      </Select>

      <Select value={target} onValueChange={onTargetChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Cible" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les cibles</SelectItem>
          <SelectItem value="note">Notes</SelectItem>
          <SelectItem value="collection">Collections</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
