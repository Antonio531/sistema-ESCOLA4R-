import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeleton'

export default function MaestrosLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} />
    </div>
  )
}
