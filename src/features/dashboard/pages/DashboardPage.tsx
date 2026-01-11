import { AdminReportsHeader } from '../components/AdminReportsHeader'
import { AdminReportsTableContainer } from '../components/AdminReportsTableContainer'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <AdminReportsHeader />
      <AdminReportsTableContainer />
    </div>
  )
}
