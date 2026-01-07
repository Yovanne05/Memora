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
import type { Collection } from "@/features/collections/models/collection.model"
import type { UseFormReturn } from "react-hook-form"
import type { NoteFormValues } from "../note-edit-form/types"

type NoteCollectionFieldProps = {
  form: UseFormReturn<NoteFormValues>
  disabled: boolean
  collections: Collection[]
  loadingCollections: boolean
}

export function NoteCollectionField({
  form,
  disabled,
  collections,
  loadingCollections,
}: Readonly<NoteCollectionFieldProps>) {
  return (
    <FormField
      control={form.control}
      name="collectionId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Collection</FormLabel>
          <FormControl>
            <Select
              value={field.value ?? "none"}
              onValueChange={(value) =>
                field.onChange(value === "none" ? null : value)
              }
              disabled={disabled || loadingCollections}
            >
              <SelectTrigger id="note-collection">
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
