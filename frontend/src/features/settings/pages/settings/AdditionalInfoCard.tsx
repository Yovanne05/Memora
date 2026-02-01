import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export const AdditionalInfoCard = memo(function AdditionalInfoCard() {
  return (
    <Card className="border-muted">
      <CardContent className="pt-6">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Base légale du traitement :</strong> Le traitement de vos
            données est basé sur votre consentement et l'exécution du contrat
            de service.
          </p>
          <p>
            <strong>Durée de conservation :</strong> Vos données sont conservées
            tant que votre compte est actif. Après suppression, vos données sont
            définitivement effacées.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
