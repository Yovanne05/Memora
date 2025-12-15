import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { flashcardEditFormSchema, type FlashcardEditForm } from "../../schemas/flashcard.schema";
import type { Flashcard } from "../../models/flashcard.model";

interface FlashcardEditFormProps {
  flashcard: Flashcard;
  onSubmit: (payload: FlashcardEditForm) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
}

export function FlashcardEditFormComponent({
  flashcard,
  onSubmit,
  onCancel,
  submitting = false,
}: Readonly<FlashcardEditFormProps>) {
  const form = useForm<FlashcardEditForm>({
    resolver: zodResolver(flashcardEditFormSchema),
    defaultValues: {
      question: flashcard.question,
      noteId: flashcard.noteId,
      answers: flashcard.answers.map((a) => ({
        answerText: a.answerText,
        isCorrect: a.isCorrect,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  const questionValue = form.watch("question");
  const answersValue = form.watch("answers");

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const isFormDisabled = submitting || form.formState.isSubmitting;
  const hasCorrectAnswer = answersValue.some((a) => a.isCorrect);
  const hasValidAnswers = answersValue.every((a) => a.answerText.trim().length > 0);

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isFormDisabled}
                  placeholder="Ex. Quelle est la capitale de la France ?"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Réponses</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ answerText: "", isCorrect: false })}
              disabled={isFormDisabled || fields.length >= 10}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une réponse
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2 rounded-lg border p-3">
              <div className="flex-1 space-y-2">
                <FormField
                  control={form.control}
                  name={`answers.${index}.answerText`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Réponse ${index + 1}`}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`answers.${index}.isCorrect`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 text-sm font-normal">
                        Réponse correcte
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={isFormDisabled}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {!hasCorrectAnswer && answersValue.length > 0 && (
            <p className="text-sm text-destructive">
              Au moins une réponse doit être marquée comme correcte.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isFormDisabled}
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={
              isFormDisabled ||
              !questionValue.trim() ||
              !hasCorrectAnswer ||
              !hasValidAnswers
            }
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
