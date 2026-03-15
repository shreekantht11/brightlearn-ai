const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <div className="aspect-video skeleton-shimmer" />
    <div className="p-5 space-y-3">
      <div className="h-5 w-3/4 rounded-lg skeleton-shimmer" />
      <div className="h-4 w-1/2 rounded-lg skeleton-shimmer" />
      <div className="flex gap-4">
        <div className="h-3 w-20 rounded-lg skeleton-shimmer" />
        <div className="h-3 w-20 rounded-lg skeleton-shimmer" />
      </div>
      <div className="h-9 w-full rounded-xl skeleton-shimmer mt-2" />
    </div>
  </div>
);

export default SkeletonCard;
