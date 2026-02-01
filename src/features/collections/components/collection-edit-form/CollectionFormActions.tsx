import { Button } from "@/components/ui/button"

type CollectionFormActionsProps = {
  onCancel?: () => void
  disabled: boolean
  submitLabel: string
}

export function CollectionFormActions({
  onCancel,
  disabled,
  submitLabel,
}: Readonly<CollectionFormActionsProps>) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
          Annuler
        </Button>
      )}
      <Button type="submit" disabled={disabled}>
        {submitLabel}
      </Button>
    </div>
  )
}
