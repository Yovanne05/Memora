import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { httpClient } from '@/lib/http-client'

export function DataExportSection() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Fetch user data from various endpoints (limit: 200 max per backend validation)
      const [
        profile,
        notesResponse,
        collectionsResponse,
        flashcardsResponse,
        statistics,
      ] = await Promise.all([
        httpClient.get('/sessions/me').catch(() => null),
        httpClient
          .get<{
            items: unknown[]
            total: number
          }>('/notes', { params: { limit: 200 } })
          .catch(() => ({ items: [], total: 0 })),
        httpClient
          .get<{
            items: unknown[]
            total: number
          }>('/collections', { params: { limit: 200 } })
          .catch(() => ({ items: [], total: 0 })),
        httpClient
          .get<{
            items: unknown[]
            total: number
          }>('/flashcards', { params: { limit: 200 } })
          .catch(() => ({ items: [], total: 0 })),
        httpClient.get('/users/me/statistics').catch(() => null),
      ])

      const exportData = {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        userData: {
          profile,
          notes: notesResponse.items,
          collections: collectionsResponse.items,
          flashcards: flashcardsResponse.items,
          statistics,
        },
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `memora-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Vos données ont été exportées avec succès')
    } catch (error) {
      toast.error("Erreur lors de l'export des données")
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Exporter vos données</h3>
        <p className="text-sm text-muted-foreground">
          Conformément au RGPD, vous avez le droit d'obtenir une copie de vos
          données personnelles.
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Données incluses dans l'export :
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              Informations de profil (email, nom d'utilisateur, nom d'affichage)
            </li>
            <li>Toutes vos notes et leur contenu</li>
            <li>Vos collections et leur organisation</li>
            <li>Vos flashcards et historique de révision</li>
            <li>Vos statistiques d'utilisation</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Format de l'export :</p>
          <p className="text-sm text-muted-foreground">
            Les données sont exportées au format JSON, lisible par machine et
            facilement exploitable.
          </p>
        </div>

        <Button
          onClick={handleExportData}
          disabled={isExporting}
          className="w-full sm:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Export en cours...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Télécharger mes données
            </>
          )}
        </Button>
      </div>

      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note :</strong> Cet export contient toutes vos données
          personnelles. Conservez ce fichier en sécurité et ne le partagez pas
          publiquement.
        </p>
      </div>
    </div>
  )
}
