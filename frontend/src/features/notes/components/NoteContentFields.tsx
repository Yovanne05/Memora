import type { UseFormReturn } from 'react-hook-form'
import { Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import type { NoteFormValues } from '../types/note-edit-form.types'

interface NoteContentFieldsProps {
  form: UseFormReturn<NoteFormValues>
  disabled: boolean
  noteId?: string
}

export function NoteContentFields({
  form,
  disabled,
  noteId,
}: Readonly<NoteContentFieldsProps>) {
  const isDirty = form.formState.isDirty

  return (
    <Card className="w-full border-0 shadow-none sm:border sm:border-border/70 sm:shadow-sm">
      <CardHeader className="hidden pb-2 sm:block">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Contenu de la note</CardTitle>
            <CardDescription>
              Retouchez le titre et le corps de votre note.
            </CardDescription>
          </div>
          {isDirty && !disabled && (
            <Button
              type="submit"
              variant="default"
              className="gap-2"
              disabled={disabled}
            >
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="w-full space-y-4 p-0 sm:p-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only sm:not-sr-only">Titre</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="note-title"
                  placeholder="Titre de la note"
                  className="h-14 w-full border-0 text-xl font-semibold shadow-none focus-visible:ring-0 sm:h-12 sm:border sm:text-lg sm:font-normal sm:shadow-sm sm:focus-visible:ring-2"
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
              <FormLabel className="sr-only">Contenu</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Commencez à rédiger votre note..."
                  editable={!disabled}
                  noteId={noteId}
                  enableCollaboration={!!noteId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isDirty && !disabled && (
          <div className="flex justify-end sm:hidden">
            <Button
              type="submit"
              variant="default"
              className="w-full gap-2 sm:w-auto"
              disabled={disabled}
            >
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
