import type { UseFormReturn } from 'react-hook-form'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    <Card className="border border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Paramètres</CardTitle>
        <CardDescription>Collection, tags et visibilité.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <NoteCollectionField
          form={form}
          disabled={disabled}
          collections={collections}
          loadingCollections={loadingCollections}
        />
        <NoteVisibilityField form={form} disabled={disabled} />
        <NoteTagsField form={form} disabled={disabled} />
      </CardContent>
    </Card>
  )
}
