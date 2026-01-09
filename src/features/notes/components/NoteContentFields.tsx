import type { UseFormReturn } from "react-hook-form"
import { Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RichTextEditor } from "@/components/editor/RichTextEditor"
import type { NoteFormValues } from "../types/note-edit-form.types"

interface NoteContentFieldsProps {
  form: UseFormReturn<NoteFormValues>
  disabled: boolean
  noteId?: string
}

export function NoteContentFields({ form, disabled, noteId }: Readonly<NoteContentFieldsProps>) {
  const isTitleDirty = !!form.formState.dirtyFields?.title

  return (
    <Card className="border border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Contenu de la note</CardTitle>
        <CardDescription>Retouchez le titre et le corps de votre note.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    id="note-title"
                    placeholder="Titre de la note"
                    className="h-12 pr-11 text-lg"
                    disabled={disabled}
                  />
                  {isTitleDirty && !disabled && (
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
                      aria-label="Enregistrer le titre"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Commencez à rédiger votre note..."
                  editable={!disabled}
                  noteId={noteId}
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
