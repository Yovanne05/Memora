import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { CollectionEditForm } from '@/features/collections/components/CollectionEditForm'

describe('CollectionEditForm', () => {
  test('submits values and uses default visibility', async () => {
    const onSubmit = vi.fn(() => Promise.resolve())

    render(<CollectionEditForm mode="create" onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Nom de la collection'), 'Ma collection')
    await userEvent.type(screen.getByLabelText('Description'), 'Une description')

    userEvent.click(screen.getByRole('button', { name: /Créer la collection/ }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Ma collection',
        description: 'Une description',
        visibility: 'private',
      })
    })
  })
})
