import {
  BookOpen,
  LayoutDashboard,
  LayoutGrid,
  Network,
  Search,
  GraduationCap,
  Settings as SettingsIcon,
} from 'lucide-react'

export const navigationItems = [
  { title: 'Tableau de bord', icon: LayoutDashboard, url: '/app/dashboard' },
  { title: 'Espace de travail', icon: LayoutGrid, url: '/app/workspace' },
  {
    title: 'Graphe de connaissances',
    icon: Network,
    url: '/app/visualization',
  },
  { title: 'Recherche', icon: Search, url: '/app/search' },
  { title: 'Révision', icon: GraduationCap, url: '/app/revision' },
]

export const accountItems = [
  { title: 'Paramètres', icon: SettingsIcon, url: '/app/settings' },
]

export const brandIcon = BookOpen
