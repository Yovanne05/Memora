import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CollectionCard } from '@/features/collections/components/CollectionCard'
import { CollectionsGrid } from '@/features/collections/components/CollectionsGrid'
import type { Collection } from '@/features/collections/models/collection.model'

const navigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate }),
}))

vi.mock(
  '@/features/collections/hooks/useToggleCollectionFavoriteMutation',
  () => ({
    useToggleCollectionFavoriteMutation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  })
)

const collection: Collection = {
  id: 'col-1',
  ownerId: 'owner',
  name: 'Title',
  description: 'Description',
  visibility: 'private',
  notes: [],
  tags: [],
  nodes: [],
  edges: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

function renderWithQueryClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('Collections list components', () => {
  test('CollectionCard calls onCardClick', async () => {
    const onCardClick = vi.fn()

    renderWithQueryClient(
      <CollectionCard collection={collection} onCardClick={onCardClick} />
    )

    await userEvent.click(screen.getByText('Title'))
    expect(onCardClick).toHaveBeenCalledWith(collection)
  })

  test('CollectionCard toggles selection in selection mode', async () => {
    const onToggleSelection = vi.fn()

    renderWithQueryClient(
      <CollectionCard
        collection={collection}
        selectionMode
        isSelected={false}
        onToggleSelection={onToggleSelection}
      />
    )

    await userEvent.click(screen.getByText('Title'))
    expect(onToggleSelection).toHaveBeenCalledWith('col-1')
  })

  test('CollectionsGrid renders collection cards', () => {
    renderWithQueryClient(
      <CollectionsGrid
        items={[collection, { ...collection, id: 'col-2', name: 'Second' }]}
      />
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
