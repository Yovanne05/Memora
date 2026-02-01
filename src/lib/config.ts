const runtimeApiUrl = window.ENV?.API_URL
const runtimeSocketPath = window.ENV?.SOCKETIO_PATH
const runtimeSocketUrl = window.ENV?.SOCKETIO_URL
const isPlaceholder = runtimeApiUrl?.includes('${')
const isSocketPathPlaceholder = runtimeSocketPath?.includes('${')
const isSocketUrlPlaceholder = runtimeSocketUrl?.includes('${')
const apiUrl =
  !runtimeApiUrl || isPlaceholder
    ? (import.meta.env.VITE_API_URL ?? '')
    : runtimeApiUrl
const socketUrl =
  !runtimeSocketUrl || isSocketUrlPlaceholder
    ? (import.meta.env.VITE_SOCKETIO_URL ?? apiUrl)
    : runtimeSocketUrl
const socketPath =
  !runtimeSocketPath || isSocketPathPlaceholder
    ? (import.meta.env.VITE_SOCKETIO_PATH ?? '/socket.io')
    : runtimeSocketPath

export const config = {
  apiUrl,
  socketUrl,
  socketPath,
}
