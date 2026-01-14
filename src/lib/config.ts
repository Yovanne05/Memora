const runtimeApiUrl = window.ENV?.API_URL
const isPlaceholder = runtimeApiUrl?.includes('${')
const apiUrl =
  !runtimeApiUrl || isPlaceholder
    ? (import.meta.env.VITE_API_URL ?? '')
    : runtimeApiUrl

export const config = {
  apiUrl,
}
