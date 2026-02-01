import { useCallback, useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import * as Y from 'yjs'
import { YjsSocketIOProvider } from '../lib/yjs-socketio-provider'

export type UseYjsProviderOptions = {
  socket: Socket | null
  noteId: string
  isConnected: boolean
  initialContent?: string | null
  onSynced?: () => void
  onError?: (error: Error) => void
}

export type UseYjsProviderReturn = {
  doc: Y.Doc | null
  isSynced: boolean
}

export function useYjsProvider(
  options: UseYjsProviderOptions
): UseYjsProviderReturn {
  const { socket, noteId, isConnected, onSynced, onError } = options

  const [doc, setDoc] = useState<Y.Doc | null>(null)
  const [isSynced, setIsSynced] = useState(false)

  const docRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<YjsSocketIOProvider | null>(null)

  const createProvider = useCallback(() => {
    if (!socket || !isConnected) {
      return
    }

    if (!docRef.current) {
      docRef.current = new Y.Doc()
      setDoc(docRef.current)
    }

    if (!providerRef.current) {
      providerRef.current = new YjsSocketIOProvider(docRef.current, {
        socket,
        noteId,
        onSynced: () => {
          setIsSynced(true)
          onSynced?.()
        },
        onError: (err) => {
          onError?.(err)
        },
      })
    } else {
      providerRef.current.requestSync()
    }
  }, [socket, noteId, isConnected, onSynced, onError])

  const destroyProvider = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.destroy()
      providerRef.current = null
    }
    setIsSynced(false)
  }, [])

  useEffect(() => {
    if (isConnected) {
      createProvider()
    } else {
      queueMicrotask(() => setIsSynced(false))
    }

    return () => {
      destroyProvider()
    }
  }, [isConnected, createProvider, destroyProvider])

  return {
    doc,
    isSynced,
  }
}
