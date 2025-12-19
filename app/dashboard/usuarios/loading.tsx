import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeleton'

export default function UsuariosLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} />
    </div>
  )
}
