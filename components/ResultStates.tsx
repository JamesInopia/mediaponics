export function ResultsSkeleton({ variant }: { variant: "grid" | "rows" }) {
  const rows = variant === "rows";
  return (
    <div
      aria-hidden="true"
      className={
        rows
          ? "space-y-4"
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {Array.from({ length: rows ? 6 : 8 }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-xl bg-black/10 ${
            rows ? "h-20" : "h-56"
          }`}
        />
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-black/10 bg-white p-10 text-center shadow-md"
    >
      <p className="font-semibold">Couldn&apos;t load assets</p>
      {message && <p className="mt-1 text-sm text-black/60">{message}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full border border-black px-4 py-1 text-xs hover:bg-black/5"
      >
        Try again
      </button>
    </div>
  );
}

export function LoadMore({
  shown,
  total,
  hasMore,
  loading,
  failed,
  onClick,
}: {
  shown: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  failed: boolean;
  onClick: () => void;
}) {
  return (
    <div className="mt-8 text-center">
      <p className="text-xs text-black/60">
        Showing {shown} of {total}
      </p>
      {failed && (
        <p role="alert" className="mt-2 text-sm">
          Couldn&apos;t load more.
        </p>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="mt-3 rounded-full border border-black px-5 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
        >
          {failed ? "Try again" : loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
