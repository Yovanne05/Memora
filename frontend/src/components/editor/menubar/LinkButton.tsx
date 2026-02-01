import { Editor } from '@tiptap/react'
import { useState } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface LinkButtonProps {
  editor: Editor
}

export function LinkButton({ editor }: Readonly<LinkButtonProps>) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setLinkUrl('')
    setShowLinkInput(false)
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setLinkUrl('')
    setShowLinkInput(false)
  }

  return (
    <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          aria-label="Insérer un lien"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setLink()
              }
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={setLink} className="flex-1">
              Ajouter
            </Button>
            {editor.isActive('link') && (
              <Button size="sm" variant="destructive" onClick={removeLink} className="flex-1">
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
