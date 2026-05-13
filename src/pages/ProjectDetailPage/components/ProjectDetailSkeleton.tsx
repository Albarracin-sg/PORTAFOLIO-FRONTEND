import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded-full" />

          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-12 w-2/3 rounded-2xl" />
        <Skeleton className="h-5 w-48 rounded-xl" />

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>

          <div className="lg:col-span-4">
            <Skeleton className="h-[480px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
