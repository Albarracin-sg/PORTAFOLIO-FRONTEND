import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";

interface BulkAnalysisReportProps {
  result: string | null;
  onClose: () => void;
}

export function BulkAnalysisReport({ result, onClose }: BulkAnalysisReportProps) {
  if (!result) return null;

  return (
    <Card className="border-violet-400/30 bg-violet-500/5 backdrop-blur-sm animate-in zoom-in-95 duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-violet-700 dark:text-violet-300">
          <Sparkles className="size-5" />
          Global IA Strategy Report
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-8 rounded-full" 
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Markdown className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-violet-600 dark:prose-headings:text-violet-400">
          {result}
        </Markdown>
      </CardContent>
    </Card>
  );
}
