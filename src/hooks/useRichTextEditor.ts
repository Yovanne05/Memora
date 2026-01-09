import { useEffect, useMemo, useState } from "react"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCaret from "@tiptap/extension-collaboration-caret"
import * as Y from "yjs"
import { HocuspocusProvider } from "@hocuspocus/provider"
import { common, createLowlight } from "lowlight"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { collabService } from "@/features/collab/services/collab.service"
import { config } from "@/lib/config"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"
import { ResizableImage } from "../lib/ResizableImage"
import { parseContent } from "../lib/content"

type UseRichTextEditorArgs = {
  content: string
  onChange: (content: string) => void
  placeholder: string
  editable: boolean
  noteId?: string
}

type CollabUser = {
  id?: string | null
  name: string
  color?: string | null
}

const lowlight = createLowlight(common)

const COLOR_PALETTE = [
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
]

function getUserColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length
  return COLOR_PALETTE[index]
}

export function useRichTextEditor({
  content,
  onChange,
  placeholder,
  editable,
  noteId,
}: UseRichTextEditorArgs) {
  const { user } = useAuth()
  const [collabDocument, setCollabDocument] = useState<Y.Doc | null>(null)
  const [collabToken, setCollabToken] = useState<string | null>(null)
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null)

  useEffect(() => {
    setCollabToken(null)
    setProvider(null)
  }, [noteId])

  useEffect(() => {
    if (!noteId || !config.collabWsUrl) {
      setCollabDocument(null)
      return
    }

    const document = new Y.Doc()
    setCollabDocument(document)

    return () => {
      document.destroy()
      setCollabDocument(null)
    }
  }, [noteId])

  useEffect(() => {
    if (!noteId) return

    let isActive = true

    const fetchToken = async () => {
      try {
        const session = await collabService.createSession(noteId)
        if (isActive) {
          setCollabToken(session.collab_token)
        }
      } catch (error) {
        logger.error("Failed to create collab session:", error)
      }
    }

    fetchToken()

    return () => {
      isActive = false
    }
  }, [noteId])

  useEffect(() => {
    if (!collabDocument || !collabToken || !noteId || !config.collabWsUrl) {
      setProvider(null)
      return
    }

    const nextProvider = new HocuspocusProvider({
      url: config.collabWsUrl,
      name: noteId,
      token: collabToken,
      document: collabDocument,
    })

    setProvider(nextProvider)

    return () => {
      nextProvider.destroy()
    }
  }, [collabDocument, collabToken, noteId])

  const caretUser = useMemo<CollabUser>(() => {
    const name = user?.displayName ?? user?.username ?? "Utilisateur"
    const colorSource = user?.id ?? name
    const color = user?.color ?? getUserColor(colorSource)
    return { id: user?.id ?? null, name, color }
  }, [user?.color, user?.displayName, user?.id, user?.username])

  const enableCollaboration = Boolean(collabDocument)

  useEffect(() => {
    if (!provider) return
    provider.awareness?.setLocalStateField("user", caretUser)
  }, [caretUser, provider])

  const [collabUsers, setCollabUsers] = useState<CollabUser[]>([])

  useEffect(() => {
    if (!provider?.awareness) {
      setCollabUsers(caretUser ? [caretUser] : [])
      return
    }

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values())
      const users = states
        .map((state) => state?.user as CollabUser | undefined)
        .filter((u): u is CollabUser => Boolean(u?.name))
        .map((u) => ({
          id: u.id ?? null,
          name: u.name,
          color: u.color ?? null,
        }))

      console.log("Collab users:", users)
      setCollabUsers(users.length > 0 ? users : [caretUser])
    }

    updateUsers()
    provider.awareness.on("change", updateUsers)

    return () => {
      provider.awareness.off("change", updateUsers)
    }
  }, [caretUser, provider])

  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        codeBlock: false,
        history: !collabDocument,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-muted rounded-md p-4 font-mono text-sm",
        },
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
    ]

    if (collabDocument) {
      baseExtensions.push(
        Collaboration.configure({
          document: collabDocument,
        })
      )
    }

    if (provider) {
      baseExtensions.push(
        CollaborationCaret.configure({
          provider,
          user: caretUser,
        })
      )
    }

    return baseExtensions
  }, [caretUser, collabDocument, placeholder, provider])

  const editor = useEditor(
    {
      extensions,
      content: enableCollaboration ? undefined : parseContent(content),
      editable,
      onUpdate: ({ editor: activeEditor }) => {
        const json = activeEditor.getJSON()
        onChange(JSON.stringify(json))
      },
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-p:leading-relaxed prose-p:text-muted-foreground",
            "prose-a:text-primary prose-a:underline prose-a:cursor-pointer",
            "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
            "prose-pre:bg-muted prose-pre:p-4",
            "prose-ul:list-disc prose-ol:list-decimal",
            "prose-li:text-muted-foreground",
            "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
            "prose-img:rounded-lg prose-img:shadow-md prose-img:my-4"
          ),
        },
      },
    },
    [editable, enableCollaboration, extensions]
  )

  useEffect(() => {
    if (!editor) return
    if (enableCollaboration) return

    const currentContent = JSON.stringify(editor.getJSON())
    const newContent = parseContent(content)

    if (typeof newContent === "string") {
      if (currentContent !== newContent) {
        editor.commands.setContent(newContent)
      }
    } else {
      const newContentStr = JSON.stringify(newContent)
      if (currentContent !== newContentStr) {
        editor.commands.setContent(newContent)
      }
    }
  }, [content, editor, enableCollaboration])

  return { editor, collabUsers }
}
