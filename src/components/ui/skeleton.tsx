import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  variant?: "default" | "card" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  animated = true,
  variant = "default",
  width,
  height,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[#1A1A1A] rounded-sm",
        animated && "animate-pulse",
        {
          "h-5 w-full": variant === "text",
          "aspect-square rounded-full": variant === "circular",
          "h-8 w-full": variant === "rectangular",
        },
        className
      )}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      {...props}
    />
  )
}

export function MangaCardSkeleton() {
  return (
    <div className="border border-[#1a1a1a] rounded overflow-hidden bg-[#121212]">
      <div className="relative">
        <Skeleton className="aspect-[2/3] w-full" />
      </div>
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-3/4 h-4" />
        <div className="flex justify-between pt-1">
          <Skeleton variant="text" className="w-1/3 h-3" />
          <Skeleton variant="text" className="w-1/3 h-3" />
        </div>
      </div>
    </div>
  );
}

export function ChapterRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
      <div className="flex items-center">
        <Skeleton className="w-8 h-5 mr-3" />
        <Skeleton className="w-40 h-5" />
      </div>
      <div className="flex items-center">
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}

export function MangaDetailSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 flex-shrink-0">
        <Skeleton className="aspect-[2/3] w-full rounded" />
        <div className="flex mt-4 gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="flex-grow space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex">
              <Skeleton className="w-24 h-4 mr-2" />
              <Skeleton className="flex-1 h-4" />
            </div>
          ))}
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-16 h-7 rounded-full" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
