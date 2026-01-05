import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RichTextEditor } from "@/components/editor/RichTextEditor"
import type { NoteFormValues } from "./NoteEditForm"

interface NoteContentFieldsProps {
  form: UseFormReturn<NoteFormValues>
  disabled: boolean
  noteId?: string
}

export function NoteContentFields({ form, disabled, noteId }: Readonly<NoteContentFieldsProps>) {
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
                <Input
                  {...field}
                  id="note-title"
                  placeholder="Titre de la note"
                  className="h-12 text-lg"
                  disabled={disabled}
                />
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
