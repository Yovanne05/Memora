import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { config } from '@/lib/config'
import { getAccessToken } from '@/features/auth/lib/token-storage'
import {
  SOCKET_PATH,
  RECONNECTION_DELAY,
  MAX_RECONNECTION_ATTEMPTS,
} from '../lib/socket-events'

export type UseSocketOptions = {
  enabled: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export type UseSocketReturn = {
  socket: Socket | null
  isConnected: boolean
  isConnecting: boolean
  error: Error | null
  connect: () => void
  disconnect: () => void
}

export function useSocket(options: UseSocketOptions): UseSocketReturn {
  const { enabled, onConnect, onDisconnect, onError } = options

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const isDisconnectingRef = useRef(false)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onConnectRef.current = onConnect
    onDisconnectRef.current = onDisconnect
    onErrorRef.current = onError
  })

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    isDisconnectingRef.current = true

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    setSocket(null)
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      return () => {
        isDisconnectingRef.current = true

        if (socketRef.current) {
          socketRef.current.close()
          socketRef.current = null
        }

        setSocket(null)
        setIsConnected(false)
        setIsConnecting(false)
      }
    }

    if (socketRef.current?.connected) {
      return
    }

    const token = getAccessToken()
    if (!token) {
      const authError = new Error('No authentication token found')
      queueMicrotask(() => {
        setError(authError)
        onErrorRef.current?.(authError)
      })
      return
    }

    queueMicrotask(() => {
      setIsConnecting(true)
      setError(null)
    })
    isDisconnectingRef.current = false

    const apiUrl = config.apiUrl || 'http://localhost:5000'
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const socketUrl = `${baseUrl}${SOCKET_PATH}`

    const newSocket = io(socketUrl, {
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionDelay: RECONNECTION_DELAY,
      reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
      transports: ['polling'],
      upgrade: false,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
      onConnectRef.current?.()
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      if (!isDisconnectingRef.current) {
        setIsConnecting(true)
      }
      onDisconnectRef.current?.()
    })

    newSocket.on('connect_error', (err) => {
      setError(err)
      onErrorRef.current?.(err)
      if (!isDisconnectingRef.current) {
        setIsConnecting(true)
      }
    })

    socketRef.current = newSocket
    queueMicrotask(() => setSocket(newSocket))

    return () => {
      isDisconnectingRef.current = true

      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }

      setSocket(null)
      setIsConnected(false)
      setIsConnecting(false)
    }
  }, [enabled])

  return {
    socket,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}
