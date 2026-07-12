import { Button } from "@/components/ui/button";

interface ProjectPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: (key: string) => string;
}

export function ProjectPagination({
  currentPage,
  totalPages,
  onPageChange,
  t,
}: ProjectPaginationProps) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {String(t("projects.pagination.page"))
          .replace("{current}", String(currentPage))
          .replace("{total}", String(totalPages))}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="dark:bg-zinc-950 dark:border-white/10 dark:hover:bg-white/[0.06]"
        >
          {t("projects.pagination.previous")}
        </Button>
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page)}
                className={`h-10 w-10 shrink-0 rounded-xl ${page === currentPage ? "" : "dark:bg-zinc-950 dark:border-white/10 dark:hover:bg-white/[0.06]"}`}
              >
              {page}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="dark:bg-zinc-950 dark:border-white/10 dark:hover:bg-white/[0.06]"
        >
          {t("projects.pagination.next")}
        </Button>
      </div>
    </div>
  );
}
