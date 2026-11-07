/** Écrans de chargement : la mise en page apparaît tout de suite, le contenu arrive ensuite. */
const Bar = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-ink/[0.07] ${className}`} />;

export function PageSkeleton({ cards = 6, title = true }: { cards?: number; title?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Chargement">
      {title && (
        <div className="mb-8 space-y-3">
          <Bar className="h-3 w-24" />
          <Bar className="h-10 w-72" />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="card space-y-3">
            <Bar className="h-4 w-1/2" />
            <Bar className="h-3 w-3/4" />
            <Bar className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-3"><Bar className="h-3 w-20" /><Bar className="h-8 w-28" /></div>
        ))}
      </div>
      <div className="card space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <Bar key={i} className="h-6 w-full" />)}
      </div>
    </div>
  );
}
