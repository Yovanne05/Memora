import { Outlet, Link } from '@tanstack/react-router'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-3 border-b border-slate-800 flex gap-3">
        <Link to="/" className="[&.active]:font-bold">
          Accueil
        </Link>
        <Link to="/collections" className="[&.active]:font-bold">
          Collections
        </Link>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
