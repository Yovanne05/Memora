import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteAccountDialog } from '@/features/settings/components/account-deletion/DeleteAccountDialog'
import { DeletionInfo } from '@/features/settings/components/account-deletion/DeletionInfo'

describe('DeleteAccountDialog', () => {
  const mockProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    confirmText: '',
    onConfirmTextChange: vi.fn(),
    onDelete: vi.fn(),
    isPending: false,
  }

  it('should render dialog when open', () => {
    render(<DeleteAccountDialog {...mockProps} />)
    expect(screen.getByText('Êtes-vous absolument sûr ?')).toBeInTheDocument()
  })

  it('should display warning message', () => {
    render(<DeleteAccountDialog {...mockProps} />)
    expect(
      screen.getByText(/Cette action est irréversible/)
    ).toBeInTheDocument()
  })

  it('should render confirmation input', () => {
    render(<DeleteAccountDialog {...mockProps} />)
    const input = screen.getByPlaceholderText('SUPPRIMER')
    expect(input).toBeInTheDocument()
  })

  it('should call onConfirmTextChange when typing', () => {
    render(<DeleteAccountDialog {...mockProps} />)
    const input = screen.getByPlaceholderText('SUPPRIMER')
    fireEvent.change(input, { target: { value: 'TEST' } })
    expect(mockProps.onConfirmTextChange).toHaveBeenCalledWith('TEST')
  })

  it('should disable delete button when confirmText is incorrect', () => {
    render(<DeleteAccountDialog {...mockProps} confirmText="WRONG" />)
    const deleteButton = screen.getByText('Supprimer définitivement')
    expect(deleteButton).toBeDisabled()
  })

  it('should enable delete button when confirmText is correct', () => {
    render(<DeleteAccountDialog {...mockProps} confirmText="SUPPRIMER" />)
    const deleteButton = screen.getByText('Supprimer définitivement')
    expect(deleteButton).not.toBeDisabled()
  })

  it('should call onDelete when confirmed', () => {
    render(<DeleteAccountDialog {...mockProps} confirmText="SUPPRIMER" />)
    const deleteButton = screen.getByText('Supprimer définitivement')
    fireEvent.click(deleteButton)
    expect(mockProps.onDelete).toHaveBeenCalled()
  })

  it('should show loading state when pending', () => {
    render(<DeleteAccountDialog {...mockProps} isPending={true} />)
    expect(screen.getByText('Suppression...')).toBeInTheDocument()
  })

  it('should disable button when pending', () => {
    render(
      <DeleteAccountDialog
        {...mockProps}
        isPending={true}
        confirmText="SUPPRIMER"
      />
    )
    const deleteButton = screen.getByText('Suppression...')
    expect(deleteButton).toBeDisabled()
  })

  it('should display GDPR information', () => {
    render(<DeleteAccountDialog {...mockProps} />)
    expect(screen.getByText(/Droit à l'oubli \(RGPD\)/)).toBeInTheDocument()
  })

  it('should render cancel button', () => {
    render(<DeleteAccountDialog {...mockProps} />)
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })
})

describe('DeletionInfo', () => {
  it('should render heading', () => {
    render(<DeletionInfo />)
    expect(screen.getByText('Supprimer mon compte')).toBeInTheDocument()
  })

  it('should display warning message', () => {
    render(<DeletionInfo />)
    expect(
      screen.getByText(/Une fois votre compte supprimé/)
    ).toBeInTheDocument()
  })

  it('should list data that will be deleted', () => {
    render(<DeletionInfo />)
    expect(
      screen.getByText('Données qui seront supprimées :')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Votre profil et informations personnelles/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Toutes vos notes/)).toBeInTheDocument()
    expect(screen.getByText(/Toutes vos collections/)).toBeInTheDocument()
    expect(screen.getByText(/Toutes vos flashcards/)).toBeInTheDocument()
    expect(screen.getByText(/Vos statistiques/)).toBeInTheDocument()
    expect(
      screen.getByText(/Vos partages et collaborations/)
    ).toBeInTheDocument()
  })

  it('should display export advice', () => {
    render(<DeletionInfo />)
    expect(
      screen.getByText(/pensez à exporter vos données/)
    ).toBeInTheDocument()
  })

  it('should render warning icon', () => {
    const { container } = render(<DeletionInfo />)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should emphasize irreversibility', () => {
    render(<DeletionInfo />)
    expect(screen.getByText(/irréversible/)).toBeInTheDocument()
  })

  it('should render export reminder', () => {
    render(<DeletionInfo />)
    expect(screen.getByText(/Conseil :/)).toBeInTheDocument()
  })

  it('should list all deletion items', () => {
    render(<DeletionInfo />)
    const lists = screen.getAllByRole('list')
    expect(lists.length).toBeGreaterThan(0)
  })

  it('should display advice in highlighted box', () => {
    const { container } = render(<DeletionInfo />)
    const adviceBox = container.querySelector('.bg-yellow-50')
    expect(adviceBox).toBeInTheDocument()
  })

  it('should mention section reference for export', () => {
    render(<DeletionInfo />)
    expect(screen.getByText(/dans la section ci-dessus/)).toBeInTheDocument()
  })
})
