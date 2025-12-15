import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  FormDescription,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { flashcardEditFormSchema, type FlashcardEditForm } from "../../schemas/flashcard.schema";

interface CreateFlashcardDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit: (payload: FlashcardEditForm) => Promise<void> | void;
  submitting?: boolean;
  noteId: string;
}

export function CreateFlashcardDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
  noteId,
}: Readonly<CreateFlashcardDialogProps>) {
  const form = useForm<FlashcardEditForm>({
    resolver: zodResolver(flashcardEditFormSchema),
    defaultValues: {
      question: "",
      noteId,
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

  const questionValue = form.watch("question");
  const answersValue = form.watch("answers");

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset({
      question: "",
      noteId,
      answers: [
        { answerText: "", isCorrect: true },
        { answerText: "", isCorrect: false },
      ],
    });
  });

  const isFormDisabled = submitting || form.formState.isSubmitting;
  const hasCorrectAnswer = answersValue.some((a) => a.isCorrect);
  const hasValidAnswers = answersValue.every((a) => a.answerText.trim().length > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          form.reset({
            question: "",
            noteId,
            answers: [
              { answerText: "", isCorrect: true },
              { answerText: "", isCorrect: false },
            ],
          });
        }
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle flashcard</DialogTitle>
          <DialogDescription>
            Créez une flashcard avec une question et plusieurs réponses possibles.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
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
                      autoFocus
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

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isFormDisabled}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  isFormDisabled ||
                  !questionValue.trim() ||
                  !hasCorrectAnswer ||
                  !hasValidAnswers
                }
              >
                {submitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
