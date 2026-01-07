import { useMemo } from "react"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"

import { cn } from "@/lib/utils"
import { ResizableImage } from "../lib/ResizableImage"
import { parseContent } from "../lib/content"

const lowlight = createLowlight(common)

export function useRichTextDisplay(content: string) {
  const parsedContent = useMemo(() => parseContent(content), [content])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer hover:text-primary/80",
          target: "_blank",
          rel: "noopener noreferrer",
        },
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
    ],
    content: parsedContent,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none",
          "prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-p:leading-relaxed prose-p:text-muted-foreground",
          "prose-a:text-primary prose-a:underline prose-a:cursor-pointer",
          "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-muted prose-pre:p-4",
          "prose-ul:list-disc prose-ol:list-decimal",
          "prose-li:text-muted-foreground",
          "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
          "prose-strong:font-semibold prose-strong:text-foreground",
          "prose-em:italic",
          "prose-img:rounded-lg prose-img:shadow-md prose-img:my-4"
        ),
      },
    },
  })

  return {
    editor,
    isEmpty: !content || content.trim().length === 0,
  }
}
