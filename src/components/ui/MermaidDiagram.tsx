import { useEffect, useRef, useState, useId, useCallback } from "react";
import mermaid from "mermaid";
import { useTheme } from "@/features/theme";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "./utils";

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

export function MermaidDiagram({ code, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const reactId = useId();
  const diagramId = `mermaid-${reactId.replace(/:/g, "m")}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      toast.success(t("mermaid.copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [code, t]);

  useEffect(() => {
    if (!code.trim() || !containerRef.current) return;

    let cancelled = false;

    async function render() {
      // Re-initialize mermaid with correct theme on every render
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "loose",
      });

      try {
        const { svg } = await mermaid.render(diagramId, code.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Force SVG to respect container width
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code, diagramId, isDark]);

  if (error) {
    return (
      <div className="relative group my-4">
        <button
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium sm:opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-105 active:scale-95 border-black/8 bg-white/80 text-zinc-500 hover:text-zinc-800 dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200 backdrop-blur-sm z-10"
          title={t("mermaid.copyTitle")}
        >
          {copied ? (
            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
        </button>
        <pre className="overflow-x-auto rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm dark:border-red-400/20 dark:bg-red-400/5">
          <code className="text-red-600 dark:text-red-400">{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group my-4 flex justify-center overflow-x-auto overflow-y-hidden rounded-lg border p-4",
        "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
    >
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 flex items-center rounded-md border p-1.5 sm:opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-105 active:scale-95 border-black/8 bg-white/80 text-zinc-500 hover:text-zinc-800 dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200 backdrop-blur-sm z-10"
        title={t("mermaid.copyTitle")}
      >
        {copied ? (
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        )}
      </button>
      <div ref={containerRef} className="w-full min-w-0 [&>svg]:max-w-full [&>svg]:h-auto" />
    </div>
  );
}
