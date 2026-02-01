import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TermsIntroduction } from '@/features/auth/components/terms/TermsIntroduction'
import { TermsDataCollection } from '@/features/auth/components/terms/TermsDataCollection'
import { TermsUserRights } from '@/features/auth/components/terms/TermsUserRights'
import { TermsResponsibility } from '@/features/auth/components/terms/TermsResponsibility'
import { TermsReporting } from '@/features/auth/components/terms/TermsReporting'
import { TermsSecurityAndMisc } from '@/features/auth/components/terms/TermsSecurityAndMisc'

describe('TermsIntroduction', () => {
  it('should render heading', () => {
    render(<TermsIntroduction />)
    expect(
      screen.getByText("1. Présentation de l'application")
    ).toBeInTheDocument()
  })

  it('should render application description', () => {
    render(<TermsIntroduction />)
    expect(screen.getByText(/Memora est une application/)).toBeInTheDocument()
  })
})

describe('TermsDataCollection', () => {
  it('should render heading', () => {
    render(<TermsDataCollection />)
    expect(
      screen.getByText('2. Inscription et données collectées')
    ).toBeInTheDocument()
  })

  it('should list collected data types', () => {
    render(<TermsDataCollection />)
    expect(screen.getByText(/Adresse e-mail/)).toBeInTheDocument()
    expect(screen.getByText(/Mot de passe/)).toBeInTheDocument()
    expect(screen.getByText(/Nom d'utilisateur/)).toBeInTheDocument()
  })

  it('should mention data security', () => {
    render(<TermsDataCollection />)
    expect(
      screen.getByText(/ne seront jamais partagées avec des tiers/)
    ).toBeInTheDocument()
  })
})

describe('TermsUserRights', () => {
  it('should render heading', () => {
    render(<TermsUserRights />)
    expect(screen.getByText('3. Vos droits (RGPD)')).toBeInTheDocument()
  })

  it('should list all GDPR rights', () => {
    render(<TermsUserRights />)
    expect(screen.getByText(/Droit d'accès/)).toBeInTheDocument()
    expect(screen.getByText(/Droit de rectification/)).toBeInTheDocument()
    expect(screen.getByText(/Droit à l'effacement/)).toBeInTheDocument()
    expect(screen.getByText(/Droit d'opposition/)).toBeInTheDocument()
  })

  it('should display contact email', () => {
    render(<TermsUserRights />)
    const link = screen.getByRole('link', {
      name: /infoiut@iut.univ-paris8.fr/,
    })
    expect(link).toHaveAttribute('href', 'mailto:infoiut@iut.univ-paris8.fr')
  })

  it('should mention data retention policy', () => {
    render(<TermsUserRights />)
    expect(
      screen.getByText(/Vos données sont conservées tant que votre compte/)
    ).toBeInTheDocument()
  })
})

describe('TermsResponsibility', () => {
  it('should render heading', () => {
    render(<TermsResponsibility />)
    expect(screen.getByText('4. Responsabilité et contenu')).toBeInTheDocument()
  })

  it('should list user responsibilities', () => {
    render(<TermsResponsibility />)
    expect(screen.getByText(/responsable du contenu/)).toBeInTheDocument()
    expect(
      screen.getByText(/droits d'auteur et la propriété intellectuelle/)
    ).toBeInTheDocument()
  })

  it('should mention prohibited content', () => {
    render(<TermsResponsibility />)
    expect(
      screen.getByText(/illégal, diffamatoire, discriminatoire/)
    ).toBeInTheDocument()
  })
})

describe('TermsReporting', () => {
  it('should render heading', () => {
    render(<TermsReporting />)
    expect(
      screen.getByText('5. Signalement de contenu inapproprié')
    ).toBeInTheDocument()
  })

  it('should explain reporting process', () => {
    render(<TermsReporting />)
    expect(
      screen.getByText(/Signaler une note ou une collection/)
    ).toBeInTheDocument()
  })

  it('should display admin contact email', () => {
    render(<TermsReporting />)
    const link = screen.getByRole('link', {
      name: /infoiut@iut.univ-paris8.fr/,
    })
    expect(link).toHaveAttribute('href', 'mailto:infoiut@iut.univ-paris8.fr')
  })

  it('should mention admin actions', () => {
    render(<TermsReporting />)
    expect(
      screen.getByText(/avertissement, suppression du contenu/)
    ).toBeInTheDocument()
  })
})

describe('TermsSecurityAndMisc', () => {
  it('should render security section heading', () => {
    render(<TermsSecurityAndMisc />)
    expect(
      screen.getByText('6. Sécurité et confidentialité')
    ).toBeInTheDocument()
  })

  it('should mention password encryption', () => {
    render(<TermsSecurityAndMisc />)
    expect(
      screen.getByText(/Les mots de passe sont chiffrés/)
    ).toBeInTheDocument()
  })

  it('should render modifications section', () => {
    render(<TermsSecurityAndMisc />)
    expect(screen.getByText('7. Modifications des CGU')).toBeInTheDocument()
  })

  it('should render contact section', () => {
    render(<TermsSecurityAndMisc />)
    expect(screen.getByText('8. Contact')).toBeInTheDocument()
  })

  it('should display last update date', () => {
    render(<TermsSecurityAndMisc />)
    expect(
      screen.getByText(/Dernière mise à jour : Janvier 2026/)
    ).toBeInTheDocument()
  })

  it('should mention acceptance acknowledgment', () => {
    render(<TermsSecurityAndMisc />)
    expect(
      screen.getByText(/En cochant la case "J'accepte/)
    ).toBeInTheDocument()
  })
})
