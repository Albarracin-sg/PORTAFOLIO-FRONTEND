import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="border-zinc-200 bg-white/85 dark:bg-zinc-950/75 dark:border-white/10">
      <CardContent className="pt-4 sm:pt-6">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{value}</div>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-zinc-600 dark:text-zinc-400">{label}</p>
      </CardContent>
    </Card>
  );
}
