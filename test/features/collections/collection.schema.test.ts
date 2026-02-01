import { collectionFormSchema } from "@/features/collections/schemas/collection.schema"

describe("collection.schema", () => {
  test("valide un formulaire correct et nettoie la description vide", () => {
    const result = collectionFormSchema.parse({
      name: "Titre",
      description: "   ",
      visibility: "private",
    })

    expect(result).toEqual({
      name: "Titre",
      description: undefined,
      visibility: "private",
    })
  })

  test("rejette un nom vide", () => {
    expect(() =>
      collectionFormSchema.parse({
        name: "",
        description: "Desc",
        visibility: "public",
      })
    ).toThrow()
  })
})
