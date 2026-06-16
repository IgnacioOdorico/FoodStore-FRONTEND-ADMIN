interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
    <div className="bg-surface-container-low border-b border-outline-variant px-md py-sm">
      <div className="flex gap-md">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-outline-variant">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-md px-md py-md">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm p-md">
    <Skeleton className="h-32 w-full mb-md" />
    <Skeleton className="h-4 w-3/4 mb-sm" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);
