import { render } from "@testing-library/react"
import { CollectionsListSkeleton } from "@/features/collections/components/CollectionsListSkeleton"

describe("CollectionsListSkeleton", () => {
  test("renders skeleton placeholders", () => {
    const { container } = render(<CollectionsListSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBe(18)
  })
})
