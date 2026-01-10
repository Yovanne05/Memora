/**
 * Binding personnalisé entre Yjs et Tiptap
 * Synchronise le contenu JSON de Tiptap avec un document Yjs
 */

import * as Y from 'yjs'
import { Editor } from '@tiptap/react'

export class YjsTiptapBinding {
  private doc: Y.Doc
  private editor: Editor
  private yText: Y.Text
  private isApplyingRemoteChange = false

  constructor(doc: Y.Doc, editor: Editor, fieldName = 'content') {
    this.doc = doc
    this.editor = editor

    // Utiliser un Y.Text pour stocker le contenu JSON sérialisé
    // Note: Une solution plus robuste utiliserait Y.XmlFragment, mais pour simplifier
    // on utilise Y.Text avec du JSON
    this.yText = doc.getText(fieldName)

    this.setupListeners()
    this.syncFromYjs()
  }

  private setupListeners() {
    // Écouter les changements locaux dans Tiptap
    this.editor.on('update', this.handleTiptapUpdate)

    // Écouter les changements distants dans Yjs
    this.yText.observe(this.handleYjsUpdate)
  }

  private handleTiptapUpdate = () => {
    if (this.isApplyingRemoteChange) {
      return
    }

    // Sérialiser le contenu Tiptap en JSON
    const content = JSON.stringify(this.editor.getJSON())

    // Mettre à jour le document Yjs
    this.doc.transact(() => {
      // Supprimer tout le contenu existant
      this.yText.delete(0, this.yText.length)
      // Insérer le nouveau contenu
      this.yText.insert(0, content)
    })
  }

  private handleYjsUpdate = () => {
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
          // Si le contenu n'est pas du JSON valide, l'ignorer
          console.warn('Invalid JSON content from Yjs:', error)
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
