import { cn } from '@/lib/utils'

interface RichTextDisplayProps {
  content: string
  className?: string
}

/**
 * Composant pour afficher le contenu riche des notes.
 * Gère la compatibilité avec les notes en texte simple (ancien format)
 * et les notes en HTML (nouveau format avec TipTap).
 */
export function RichTextDisplay({ content, className }: Readonly<RichTextDisplayProps>) {
  // Détection si le contenu est du HTML ou du texte simple
  const isHTML = content.trim().startsWith('<')

  if (isHTML) {
    // Affichage du contenu HTML enrichi
    return (
      <div
        className={cn(
          'prose prose-sm max-w-none',
          'prose-headings:font-semibold prose-headings:tracking-tight',
          'prose-p:leading-relaxed prose-p:text-muted-foreground',
          'prose-a:text-primary prose-a:underline prose-a:cursor-pointer',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-muted prose-pre:p-4',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:text-muted-foreground',
          'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
          'prose-strong:font-semibold prose-strong:text-foreground',
          'prose-em:italic',
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Affichage du texte simple (ancien format) avec préservation des sauts de ligne
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap',
        className
      )}
    >
      {content}
    </div>
  )
}
