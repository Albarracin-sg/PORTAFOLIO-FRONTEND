import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  label: string;
  value: string;
}

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <Card className="border-zinc-200 bg-white/85 dark:border-white/10 dark:bg-zinc-950/75">
      <CardContent className="pt-6 text-center">
        <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{value}</div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{label}</p>
      </CardContent>
    </Card>
  );
}
