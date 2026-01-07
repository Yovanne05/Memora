import type { CollectionVisibility } from "../../models/collection.model"

export interface CollectionFormValues {
  name: string
  description?: string
  visibility: CollectionVisibility
  tags?: string[]
}

export interface CollectionEditFormProps {
  mode: "create" | "edit"
  initial?: CollectionFormValues
  loading?: boolean
  onSubmit: (values: CollectionFormValues) => void | Promise<void>
  onCancel?: () => void
}
