import { createCollectionsService } from "@/features/collections/services/collections.service"
import type { HttpClient } from "@/lib/http-client"
import type { CollectionDto } from "@/features/collections/dtos/collection.dto"
import { vi } from "vitest"

const baseDto: CollectionDto = {
  id: "col-1",
  owner_id: "owner-1",
  name: "Titre",
  description: null,
  visibility: "private",
  notes: [],
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-02T00:00:00.000Z",
}

const createClient = (overrides?: Partial<HttpClient>): HttpClient => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  ...overrides,
})

describe("collections.service", () => {
  test("list convertit un tableau simple", async () => {
    const client = createClient({
      get: vi.fn().mockResolvedValue([baseDto]),
    })

    const service = createCollectionsService(client)
    const result = await service.list()

    expect(client.get).toHaveBeenCalledWith("/collections", { params: undefined })
    expect(result[0]).toMatchObject({
      id: baseDto.id,
      ownerId: baseDto.owner_id,
      name: baseDto.name,
      visibility: "private",
      notes: [],
    })
  })

  test("list accepte un objet items", async () => {
    const client = createClient({
      get: vi.fn().mockResolvedValue({ items: [baseDto] }),
    })
    const service = createCollectionsService(client)

    const result = await service.list({ limit: 10 })

    expect(client.get).toHaveBeenCalledWith("/collections", { params: { limit: 10 } })
    expect(result).toHaveLength(1)
  })

  test("get retourne une collection mappée", async () => {
    const client = createClient({
      get: vi.fn().mockResolvedValue(baseDto),
    })
    const service = createCollectionsService(client)

    const result = await service.get("col-1")
    expect(client.get).toHaveBeenCalledWith("/collections/col-1")
    expect(result).toMatchObject({ id: "col-1", ownerId: "owner-1" })
  })

  test("create et update envoient les DTO attendus", async () => {
    const client = createClient({
      post: vi.fn().mockResolvedValue(baseDto),
      patch: vi.fn().mockResolvedValue({ ...baseDto, name: "Maj" }),
    })
    const service = createCollectionsService(client)

    await service.create({
      ownerId: "owner-1",
      name: "Titre",
      description: undefined,
      visibility: undefined,
    })
    expect(client.post).toHaveBeenCalledWith("/collections", {
      owner_id: "owner-1",
      name: "Titre",
      description: null,
      visibility: "private",
    })

    const updated = await service.update("col-1", { name: "Maj" })
    expect(client.patch).toHaveBeenCalledWith("/collections/col-1", {
      name: "Maj",
      description: undefined,
      visibility: undefined,
    })
    expect(updated.name).toBe("Maj")
  })

  test("remove appelle le client delete", async () => {
    const client = createClient({
      delete: vi.fn().mockResolvedValue(undefined),
    })
    const service = createCollectionsService(client)

    await service.remove("col-1")
    expect(client.delete).toHaveBeenCalledWith("/collections/col-1")
  })
})
