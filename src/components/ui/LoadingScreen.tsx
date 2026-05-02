import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "./utils";

interface LoadingScreenProps {
  variant?: "full" | "inline";
  className?: string;
}

export function LoadingScreen({ variant = "full", className }: LoadingScreenProps) {
  const { t, i18n } = useTranslation();
  const [fact, setFact] = useState("");
  
  useEffect(() => {
    // Get array of facts from i18n
    const facts = t("loading.facts", { returnObjects: true });
    if (Array.isArray(facts) && facts.length > 0) {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      setFact(randomFact);
    }
  }, [i18n.language, t]);

  const isFull = variant === "full";

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm",
        isFull ? "fixed inset-0 z-[100] bg-background/80 backdrop-blur-md" : "w-full py-12 rounded-2xl border border-dashed border-violet-500/20",
        className
      )}
    >
      <div className={cn("relative", isFull ? "h-24 w-24" : "h-16 w-16")}>
        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
      
      <div className={cn("mt-6 px-6 text-center", isFull ? "max-w-md" : "max-w-sm")}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-2">
          {t("loading.didYouKnow")}
        </p>
        <p className={cn(
          "text-slate-600 dark:text-slate-400 animate-pulse",
          isFull ? "text-sm" : "text-xs"
        )}>
          {fact}
        </p>
      </div>
    </div>
  );
}
