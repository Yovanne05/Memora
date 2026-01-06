import type { UseFormReturn } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import { TagInput } from "@/components/ui/tag-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Collection } from "@/features/collections/models/collection.model"
import type { NoteFormValues } from "./NoteEditForm"

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
        <CardTitle className="text-lg">Parametres</CardTitle>
        <CardDescription>Collection, tags et visibilite.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="collectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(val) => field.onChange(val === "none" ? null : val)}
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

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibilite</FormLabel>
              <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {field.value === "public" ? "Publique" : "Privee"}
                  </p>
                  <p className="text-xs text-muted-foreground">Basculer la visibilite de la note.</p>
                </div>
                <FormControl>
                  <Switch
                    id="note-visibility"
                    aria-label="Basculer la visibilite"
                    checked={field.value === "public"}
                    onCheckedChange={(checked) => field.onChange(checked ? "public" : "private")}
                    disabled={disabled}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Ajouter des tags (Entrée ou virgule pour valider)"
                  maxTags={20}
                  disabled={disabled}
                  error={form.formState.errors.tags?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
