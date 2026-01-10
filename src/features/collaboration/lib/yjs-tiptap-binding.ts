import * as Y from 'yjs'
import { Editor } from '@tiptap/react'
import { logger } from '@/lib/logger'

export class YjsTiptapBinding {
  private readonly doc: Y.Doc
  private readonly editor: Editor
  private readonly yText: Y.Text
  private isApplyingRemoteChange = false

  constructor(doc: Y.Doc, editor: Editor, fieldName = 'content') {
    this.doc = doc
    this.editor = editor

    this.yText = doc.getText(fieldName)

    this.setupListeners()
    this.syncFromYjs()
  }

  private setupListeners() {
    this.editor.on('update', this.handleTiptapUpdate)
    this.yText.observe(this.handleYjsUpdate)
  }

  private readonly handleTiptapUpdate = () => {
    if (this.isApplyingRemoteChange) {
      return
    }

    const content = JSON.stringify(this.editor.getJSON())

    this.doc.transact(() => {
      this.yText.delete(0, this.yText.length)
      this.yText.insert(0, content)
    })
  }

  private readonly handleYjsUpdate = () => {
    if (this.isApplyingRemoteChange) {
      return
    }

    this.syncFromYjs()
  }

  private syncFromYjs() {
    this.isApplyingRemoteChange = true

    try {
      const content = this.yText.toString()

      if (content) {
        try {
          const json = JSON.parse(content)
          this.editor.commands.setContent(json, { emitUpdate: false })
        } catch (error) {
          logger.warn('Invalid JSON content from Yjs:', error)
        }
      }
    } finally {
      this.isApplyingRemoteChange = false
    }
  }

  public destroy() {
    this.editor.off('update', this.handleTiptapUpdate)
    this.yText.unobserve(this.handleYjsUpdate)
  }
}
