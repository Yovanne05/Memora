import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CollectionFormDialog } from './CollectionFormDialog'
import { useCreateCollectionMutation } from '../hooks/useCreateCollectionMutation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { CollectionFormValues } from '../types/collection-form.types'
import { logger } from '@/lib/logger'

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
}: Readonly<CreateCollectionDialogProps>) {
  const router = useRouter()
  const { user } = useAuth()
  const createMutation = useCreateCollectionMutation()

  const handleSubmit = async (values: CollectionFormValues) => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour créer une collection')
      return
    }

    try {
      const newCollection = await createMutation.mutateAsync({
        ownerId: user.id,
        name: values.name,
        description: values.description || null,
        visibility: values.visibility,
        tags: values.tags || [],
      })

      onOpenChange(false)

      await router.navigate({
        to: '/app/workspace/collections/$collectionId',
        params: { collectionId: newCollection.id },
      })
    } catch (error) {
      logger.error('Error creating collection:', error)
    }
  }

  return (
    <CollectionFormDialog
      mode="create"
      open={open}
      onClose={() => onOpenChange(false)}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
    />
  )
}
