import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { TagList } from '@/components/ui/tag-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, FolderClosed, Eye, Lock } from 'lucide-react'
import type { SearchResult } from '../types/search.types'
import type { Collection } from '@/features/collections/models/collection.model'
import type { Note } from '@/features/notes/models/note.model'
import { VISIBILITY_LABELS, VISIBILITY_BADGE_CLASSES, formatShortDate } from '@/lib/format.utils'

interface SearchResultCardProps {
  readonly result: SearchResult
}

function isCollection(item: Collection | Note): item is Collection {
  return 'notes' in item
}

function isNote(item: Collection | Note): item is Note {
  return 'content' in item
}

export function SearchResultCard({ result }: Readonly<SearchResultCardProps>) {
  const { type, item } = result

  if (type === 'collection' && isCollection(item)) {
    return (
      <Link
        to="/app/workspace/collections/$collectionId"
        params={{ collectionId: item.id }}
        className="block h-full"
        aria-label={`Ouvrir la collection ${item.name}`}
      >
        <Card className="group flex h-full cursor-pointer flex-col justify-between border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shrink-0">
                <FolderClosed className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-base">{item.name}</CardTitle>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <Badge
              variant="secondary"
              className={VISIBILITY_BADGE_CLASSES[item.visibility]}
            >
              {item.visibility === 'public' ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {VISIBILITY_LABELS[item.visibility]}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span>{item.notes.length} note{item.notes.length > 1 ? 's' : ''}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{formatShortDate(item.createdAt)}</span>
            </div>

            {item.tags && item.tags.length > 0 && (
              <TagList tags={item.tags} maxVisible={3} size="sm" />
            )}
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (type === 'note' && isNote(item)) {
    const isPublic = item.visibility === 'public'

    return (
      <Link
        to="/app/workspace/notes/$noteId"
        params={{ noteId: item.id }}
        className="block h-full"
        aria-label={`Ouvrir la note ${item.title}`}
      >
        <Card className="group flex h-full flex-col justify-between border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-base leading-tight line-clamp-2">
                  {item.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.content || 'Aucun contenu'}
                </p>
              </div>
            </div>

            <Badge
              variant="secondary"
              className={VISIBILITY_BADGE_CLASSES[item.visibility]}
            >
              {isPublic ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {VISIBILITY_LABELS[item.visibility]}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <FolderClosed className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.collectionName ?? 'Sans collection'}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{formatShortDate(item.createdAt)}</span>
            </div>

            {!!item.tags.length && (
              <TagList tags={item.tags} maxVisible={3} size="sm" variant="outline" />
            )}
          </CardContent>
        </Card>
      </Link>
    )
  }

  return null
}
