import { ShieldAlert } from 'lucide-react'

export function AdminReportsHeader() {
  return (
    <header className="flex flex-col gap-4 rounded-xl border bg-gradient-to-r from-slate-900 via-slate-950 to-black p-6 text-white shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Admin dashboard
            </p>
            <h1 className="text-2xl font-semibold">Signalements</h1>
          </div>
        </div>
      </div>

      <p className="max-w-2xl text-sm text-slate-300">
        Centralise les signalements des notes et collections. Filtre, évalue et
        applique une action pour maintenir la qualité de la base.
      </p>
    </header>
  )
}
