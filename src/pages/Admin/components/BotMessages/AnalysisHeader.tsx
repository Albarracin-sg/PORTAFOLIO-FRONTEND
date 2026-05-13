import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  Bot, 
  Search,
  Brain,
  RefreshCcw,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

interface AnalysisHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBulkAnalyze: () => void;
  onRefresh: () => void;
  isBulkAnalyzing: boolean;
  isRefreshing: boolean;
  hasThreads: boolean;
}

export function AnalysisHeader({
  searchQuery,
  onSearchChange,
  onBulkAnalyze,
  onRefresh,
  isBulkAnalyzing,
  isRefreshing,
  hasThreads
}: AnalysisHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8 sm:mb-12">
      <Button
        variant="ghost"
        asChild
        className="group mb-2 sm:mb-6 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-zinc-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
      >
        <Link to="/admin">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {t("admin.logs.back")}
        </Link>
      </Button>

      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
          {t("admin.bot.subtitle")}
        </p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <Bot className="size-10 text-violet-500 shrink-0 hidden sm:block" />
          <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            {t("admin.bot.title")}
          </h1>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rounded-2xl border-violet-100 bg-white dark:border-violet-500/10 dark:bg-white/5"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onBulkAnalyze} 
              variant="outline" 
              disabled={isBulkAnalyzing || !hasThreads}
              className="rounded-2xl border-violet-200 bg-violet-50/50 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/5 dark:hover:bg-violet-500/10 text-violet-700 dark:text-violet-400"
            >
              {isBulkAnalyzing ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Brain className="size-4 mr-2" />}
              Analyze All
            </Button>
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              className="rounded-2xl border-violet-200 bg-violet-50/50 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/5 dark:hover:bg-violet-500/10"
              disabled={isRefreshing}
            >
              <RefreshCcw className={cn("size-4 mr-2", isRefreshing && "animate-spin")} />
              {t("admin.bot.refresh")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
