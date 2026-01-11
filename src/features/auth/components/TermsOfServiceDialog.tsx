import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TermsIntroduction } from './terms/TermsIntroduction'
import { TermsDataCollection } from './terms/TermsDataCollection'
import { TermsUserRights } from './terms/TermsUserRights'
import { TermsResponsibility } from './terms/TermsResponsibility'
import { TermsReporting } from './terms/TermsReporting'
import { TermsSecurityAndMisc } from './terms/TermsSecurityAndMisc'

interface TermsOfServiceDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TermsOfServiceDialog({
  trigger,
  open,
  onOpenChange,
}: TermsOfServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conditions Générales d'Utilisation</DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement ces conditions avant d'utiliser Memora
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <TermsIntroduction />
            <TermsDataCollection />
            <TermsUserRights />
            <TermsResponsibility />
            <TermsReporting />
            <TermsSecurityAndMisc />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
