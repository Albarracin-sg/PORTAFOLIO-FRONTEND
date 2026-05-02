import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function LoadingScreen() {
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
      
      <div className="mt-8 max-w-md px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-violet-500 mb-2">
          {t("loading.didYouKnow")}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
          {fact}
        </p>
      </div>
    </div>
  );
}
