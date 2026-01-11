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
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="w-full lg:w-auto">
        <NoteCollectionField
          form={form}
          disabled={disabled}
          collections={collections}
          loadingCollections={loadingCollections}
        />
      </div>
      <div className="w-full lg:w-auto">
        <NoteVisibilityField form={form} disabled={disabled} />
      </div>
      <div className="w-full lg:w-auto">
        <NoteTagsField form={form} disabled={disabled} />
      </div>
    </div>
  )
}
