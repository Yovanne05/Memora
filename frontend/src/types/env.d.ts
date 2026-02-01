export {}

declare global {
  interface Window {
    ENV?: {
      API_URL?: string
      SOCKETIO_URL?: string
      SOCKETIO_PATH?: string
    }
  }
}
