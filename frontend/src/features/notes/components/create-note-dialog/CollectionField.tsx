import type { Control } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { NoteCreateFormInput } from "../../schemas/note.schema"
import type { Collection } from "@/features/collections/models/collection.model"

type CollectionFieldProps = {
  control: Control<NoteCreateFormInput>
  collections: Collection[]
  loadingCollections: boolean
  isFormDisabled: boolean
}

export function CollectionField({
  control,
  collections,
  loadingCollections,
  isFormDisabled,
}: Readonly<CollectionFieldProps>) {
  return (
    <FormField
      control={control}
      name="collectionId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Collection</FormLabel>
          <FormControl>
            <Select
              value={field.value ?? "none"}
              onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              disabled={isFormDisabled || loadingCollections}
            >
              <SelectTrigger id="note-collection" className="w-full">
                <SelectValue placeholder="Choisir une collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune collection</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
