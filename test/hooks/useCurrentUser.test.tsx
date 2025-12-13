import { renderHook } from "@testing-library/react"
import { useCurrentUser } from "@/hooks/useCurrentUser"

describe("useCurrentUser", () => {
  test("retourne un userId fixe", () => {
    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.userId).toBe("da3ed5de-29d4-4f28-9c39-f53fc25bc395")
  })

  test("l'userId est constant", () => {
    const { result, rerender } = renderHook(() => useCurrentUser())

    const firstUserId = result.current.userId
    rerender()

    expect(result.current.userId).toBe(firstUserId)
  })
})
