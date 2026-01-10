/**
 * Fournisseur WebSocket personnalisé pour Yjs utilisant Socket.IO
 * Compatible avec le backend CRDT (pycrdt)
 */

import * as Y from 'yjs'
import { Socket } from 'socket.io-client'
import { Awareness } from 'y-protocols/awareness'

export type YjsSocketIOProviderOptions = {
  socket: Socket
  noteId: string
  awareness?: Awareness
  onSynced?: () => void
  onError?: (error: Error) => void
}

export class YjsSocketIOProvider {
  private readonly socket: Socket
  private readonly noteId: string
  private readonly doc: Y.Doc
  private readonly awareness: Awareness
  private synced = false
  private readonly onSynced?: () => void
  private readonly onError?: (error: Error) => void

  constructor(doc: Y.Doc, options: YjsSocketIOProviderOptions) {
    this.doc = doc
    this.socket = options.socket
    this.noteId = options.noteId
    this.awareness = options.awareness || new Awareness(doc)
    this.onSynced = options.onSynced
    this.onError = options.onError

    this.setupListeners()
  }

  private setupListeners() {
    // Écouter les mises à jour du document local et les envoyer au serveur
    this.doc.on('update', this.handleLocalUpdate)

    // Écouter les mises à jour du serveur
    this.socket.on('collaboration_event', this.handleServerEvent)
    this.socket.on('crdt_sync_reply', this.handleSyncReply)

    // Demander une synchronisation initiale
    this.requestSync()
  }

  private readonly handleLocalUpdate = (
    update: Uint8Array,
    origin: unknown
  ) => {
    // Ne pas renvoyer les mises à jour qui viennent du serveur
    if (origin === this) {
      return
    }

    // Encoder en base64 pour l'envoi via JSON
    const updateBase64 = this.uint8ArrayToBase64(update)

    // Envoyer au serveur via le handler CRDT
    this.socket.emit('crdt_update', {
      note_id: this.noteId,
      update: updateBase64,
    })
  }

  private readonly handleServerEvent = (event: {
    event_type: string
    crdt_update?: string
    user_id: string
  }) => {
    // Ignorer les événements qui ne sont pas des mises à jour CRDT
    if (event.event_type !== 'crdt_update' || !event.crdt_update) {
      return
    }

    try {
      // Décoder depuis base64
      const update = this.base64ToUint8Array(event.crdt_update)

      // Appliquer la mise à jour au document (avec origin = this pour éviter les boucles)
      Y.applyUpdate(this.doc, update, this)
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to apply CRDT update')
      this.onError?.(err)
    }
  }

  private readonly handleSyncReply = (data: {
    note_id: string
    state_vector: string
    update: string
  }) => {
    if (data.note_id !== this.noteId) {
      return
    }

    try {
      // Appliquer la mise à jour de synchronisation
      if (data.update) {
        const update = this.base64ToUint8Array(data.update)
        Y.applyUpdate(this.doc, update, this)
      }

      this.synced = true
      this.onSynced?.()
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to sync CRDT')
      this.onError?.(err)
    }
  }

  private requestSync() {
    // Obtenir le vecteur d'état actuel du document
    const stateVector = Y.encodeStateVector(this.doc)
    const stateVectorBase64 = this.uint8ArrayToBase64(stateVector)

    // Demander une synchronisation au serveur
    this.socket.emit('crdt_sync_request', {
      note_id: this.noteId,
      state_vector: stateVectorBase64,
    })
  }

  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    const binString = Array.from(uint8Array, (byte) =>
      String.fromCodePoint(byte)
    ).join('')
    return btoa(binString)
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binString = atob(base64)
    return Uint8Array.from(binString, (char) => char.codePointAt(0)!)
  }

  public destroy() {
    this.doc.off('update', this.handleLocalUpdate)
    this.socket.off('collaboration_event', this.handleServerEvent)
    this.socket.off('crdt_sync_reply', this.handleSyncReply)
  }

  public isSynced(): boolean {
    return this.synced
  }

  public getAwareness(): Awareness {
    return this.awareness
  }
}
