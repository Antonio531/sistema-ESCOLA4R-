import { PageHeaderSkeleton, GridSkeleton } from '@/components/ui/skeleton'

export default function AsignaturasLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <GridSkeleton cards={6} />
    </div>
  )
}
