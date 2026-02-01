import { ShieldAlert, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AdminReportsHeaderProps = {
  activeView: 'reports' | 'users'
  onViewChange: (view: 'reports' | 'users') => void
}

export function AdminReportsHeader({
  activeView,
  onViewChange,
}: Readonly<AdminReportsHeaderProps>) {
  const title = activeView === 'users' ? 'Utilisateurs' : 'Signalements'

  return (
    <header className="flex flex-col gap-4 rounded-xl border bg-gradient-to-r from-slate-900 via-slate-950 to-black p-6 text-white shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
            {activeView === 'users' ? (
              <Users className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Admin dashboard
            </p>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'reports' ? 'secondary' : 'outline'}
            onClick={() => onViewChange('reports')}
          >
            Signalements
          </Button>
          <Button
            variant={activeView === 'users' ? 'secondary' : 'outline'}
            onClick={() => onViewChange('users')}
          >
            Utilisateurs
          </Button>
        </div>
      </div>

      {activeView === 'reports' ? (
        <p className="max-w-2xl text-sm text-slate-300">
          Centralise les signalements des notes et collections. Filtre, évalue
          et applique une action.
        </p>
      ) : (
        <p className="max-w-2xl text-sm text-slate-300">
          Gère les comptes utilisateurs, met à jour les pseudonymes et supprime
          les accès si nécessaire.
        </p>
      )}
    </header>
  )
}
