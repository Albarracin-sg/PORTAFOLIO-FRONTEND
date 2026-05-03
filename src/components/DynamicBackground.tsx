export default function DynamicBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-slate-50 dark:bg-gray-950 transition-colors duration-500"
      aria-hidden
    >
      <div className="absolute inset-0 bg-linear-to-br from-violet-50/50 via-transparent to-blue-50/30 dark:from-violet-950/20 dark:via-transparent dark:to-blue-950/20 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(124,58,237,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.08),transparent_50%)]" />
    </div>
  );
}
