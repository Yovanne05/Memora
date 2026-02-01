import type { UseFormReturn } from 'react-hook-form'

import type { Collection } from '@/features/collections/models/collection.model'
import type { NoteFormValues } from '../types/note-edit-form.types'
import { NoteCollectionField } from './note-settings-fields/NoteCollectionField'
import { NoteTagsField } from './note-settings-fields/NoteTagsField'
import { NoteVisibilityField } from './note-settings-fields/NoteVisibilityField'

interface NoteSettingsFieldsProps {
  form: UseFormReturn<NoteFormValues>
  disabled: boolean
  collections: Collection[]
  loadingCollections: boolean
}

export function NoteSettingsFields({
  form,
  disabled,
  collections,
  loadingCollections,
}: Readonly<NoteSettingsFieldsProps>) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
      <div className="flex-1">
        <NoteCollectionField
          form={form}
          disabled={disabled}
          collections={collections}
          loadingCollections={loadingCollections}
        />
      </div>
      <div className="flex-1">
        <NoteVisibilityField form={form} disabled={disabled} />
      </div>
      <div className="flex-1">
        <NoteTagsField form={form} disabled={disabled} />
      </div>
    </div>
  )
}
