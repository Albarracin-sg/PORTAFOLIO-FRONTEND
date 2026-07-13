import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
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
        isFull ? "fixed inset-0 z-[100] bg-background backdrop-blur-md" : "w-full py-12 rounded-2xl border border-dashed border-violet-500/20",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Decorative background glow */}
        <div className={cn(
          "absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse",
          isFull ? "size-24" : "size-16"
        )} />
        
        {/* Main Spinner Icon */}
        <Loader2 
          className={cn(
            "animate-spin text-violet-600 dark:text-violet-400 relative z-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]",
            isFull ? "size-16" : "size-10"
          )} 
        />
      </div>
      
      <div className={cn("mt-8 px-6 text-center", isFull ? "max-w-md" : "max-w-sm")}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-3">
          {t("loading.didYouKnow")}
        </p>
        <p className={cn(
          "text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium",
          isFull ? "text-base" : "text-sm"
        )}>
          {fact}
        </p>
        <div className="mt-4 flex justify-center gap-1.5">
          <div className="size-1 rounded-full bg-violet-400 animate-pulse scale-105 transition-transform duration-1000 ease-in-out [animation-delay:-0.3s]" />
          <div className="size-1 rounded-full bg-violet-400 animate-pulse scale-105 transition-transform duration-1000 ease-in-out [animation-delay:-0.15s]" />
          <div className="size-1 rounded-full bg-violet-400 animate-pulse scale-105 transition-transform duration-1000 ease-in-out" />
        </div>
      </div>
    </div>
  );
}
