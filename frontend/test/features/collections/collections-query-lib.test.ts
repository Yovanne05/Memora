import { COLLECTIONS_QUERY_KEYS } from "@/features/collections/hooks/collections.keys"

describe("COLLECTIONS_QUERY_KEYS", () => {
  test("builds list and detail keys", () => {
    expect(COLLECTIONS_QUERY_KEYS.all).toEqual(["collections"])
    expect(COLLECTIONS_QUERY_KEYS.lists()).toEqual(["collections", "list"])
    expect(COLLECTIONS_QUERY_KEYS.list({ page: 1 })).toEqual([
      "collections",
      "list",
      { page: 1 },
    ])
    expect(COLLECTIONS_QUERY_KEYS.details()).toEqual(["collections", "detail"])
    expect(COLLECTIONS_QUERY_KEYS.detail("col-1")).toEqual([
      "collections",
      "detail",
      "col-1",
    ])
  })
})
