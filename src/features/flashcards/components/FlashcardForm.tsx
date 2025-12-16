import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  flashcardEditFormSchema,
  type FlashcardEditForm,
  type FlashcardEditFormInput,
} from "../schemas/flashcard.schema";
import { cn } from "@/lib/utils";

interface FlashcardFormProps {
  readonly noteId: string;
  readonly onSubmit: (data: FlashcardEditForm) => void | Promise<void>;
  readonly onCancel?: () => void;
  readonly isSubmitting?: boolean;
}

export function FlashcardForm({
  noteId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: Readonly<FlashcardFormProps>) {
  const form = useForm<FlashcardEditFormInput, unknown, FlashcardEditForm>({
    resolver: zodResolver(flashcardEditFormSchema),
    defaultValues: {
      noteId,
      question: "",
      answers: [
        { answerText: "", isCorrect: true },
        { answerText: "", isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const addAnswer = () => {
    if (fields.length < 10) {
      append({ answerText: "", isCorrect: false });
    }
  };

  const toggleCorrectAnswer = (index: number) => {
    const currentAnswers = form.getValues("answers");
    const updatedAnswers = currentAnswers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index,
    }));
    form.setValue("answers", updatedAnswers);
  };

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
                <Input
                  {...field}
                  placeholder="Quelle est la capitale de la France ?"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>
              Réponses ({fields.length}/10)
            </FormLabel>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addAnswer}
              disabled={fields.length >= 10 || isSubmitting}
              className="h-8 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>

          {form.formState.errors.answers && !Array.isArray(form.formState.errors.answers) && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.answers.message}
            </p>
          )}

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                  form.watch(`answers.${index}.isCorrect`)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <Button
                  type="button"
                  size="icon"
                  variant={
                    form.watch(`answers.${index}.isCorrect`) ? "default" : "outline"
                  }
                  className="h-8 w-8 shrink-0"
                  onClick={() => toggleCorrectAnswer(index)}
                  disabled={isSubmitting}
                  title={
                    form.watch(`answers.${index}.isCorrect`)
                      ? "Réponse correcte"
                      : "Marquer comme correcte"
                  }
                >
                  <Check className="h-4 w-4" />
                </Button>

                <FormField
                  control={form.control}
                  name={`answers.${index}.answerText`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={`Réponse ${index + 1}`}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {fields.length > 2 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Cliquez sur l'icône <Check className="inline h-3 w-3" /> pour marquer la réponse correcte
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Création..." : "Créer la flashcard"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
