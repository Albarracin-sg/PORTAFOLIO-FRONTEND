import { useTranslation } from "react-i18next";

interface EndpointListProps {
  endpoints: any[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getIcon: (path: string) => any;
  formatNumber: (n: number) => string;
}

export function EndpointList({
  endpoints,
  page,
  totalPages,
  onPageChange,
  getIcon,
  formatNumber,
}: EndpointListProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 sm:mt-6 grid gap-2 sm:gap-3">
      {endpoints.map((ep) => {
        const EndpointIcon = getIcon(ep.path);
        const isSpotify = ep.path.includes("spotify");
        return (
          <div
            key={`endpoint-${ep.path}-${ep.method}`}
            className={`flex items-center justify-between rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
              isSpotify
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                : "border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <EndpointIcon className={`size-3.5 sm:size-4 shrink-0 ${isSpotify ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`} />
              <span className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-mono font-semibold ${
                isSpotify
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
              }`}>
                {ep.method}
              </span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[150px] sm:max-w-none">
                {ep.path}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-white">
                {formatNumber(ep.requests)} req
              </span>
              <span className="text-xs sm:text-sm">
                {ep.avgTime}ms
              </span>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("stats.endpointsPage")} {page + 1} {t("stats.of")} {totalPages}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
            >
              {t("stats.prev")}
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
            >
              {t("stats.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
