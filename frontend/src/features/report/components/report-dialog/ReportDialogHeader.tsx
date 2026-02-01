import { memo } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ReportDialogHeaderProps {
  targetType: 'note' | 'collection'
  targetTitle?: string
}

export const ReportDialogHeader = memo(function ReportDialogHeader({
  targetType,
  targetTitle,
}: Readonly<ReportDialogHeaderProps>) {
  return (
    <DialogHeader>
      <DialogTitle>
        Signaler {targetType === 'note' ? 'une note' : 'une collection'}
      </DialogTitle>
      <DialogDescription>
        {targetTitle && (
          <span className="block font-medium text-foreground mb-2">
            {targetTitle}
          </span>
        )}
        Vous êtes sur le point de signaler ce contenu. Notre équipe examinera
        votre signalement dans les plus brefs délais.
      </DialogDescription>
    </DialogHeader>
  )
})
