import { Brain } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopicInsight {
  label: string;
  mentions: number;
}

interface TopicRadarProps {
  topics: TopicInsight[];
}

export function TopicRadar({ topics }: TopicRadarProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-zinc-200 bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="size-4 text-violet-500" />
          {t("admin.bot.topicRadar", { defaultValue: "Topic radar" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <Badge key={topic.label} variant="outline" className="rounded-full border-violet-200 bg-violet-50/60 px-3 py-1 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
              {topic.label} · {topic.mentions}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("admin.bot.topicFallback", { defaultValue: "Topic analysis will appear as soon as threads contain user prompts." })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
