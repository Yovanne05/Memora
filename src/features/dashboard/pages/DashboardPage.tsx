import { useState } from 'react'
import { AdminReportsHeader } from '../components/AdminReportsHeader'
import { AdminReportsTableContainer } from '../components/AdminReportsTableContainer'
import { AdminUsersTableContainer } from '../components/AdminUsersTableContainer'

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<'reports' | 'users'>('reports')

  return (
    <div className="space-y-6">
      <AdminReportsHeader
        activeView={activeView}
        onViewChange={setActiveView}
      />
      {activeView === 'users' ? (
        <AdminUsersTableContainer />
      ) : (
        <AdminReportsTableContainer />
      )}
    </div>
  )
}
