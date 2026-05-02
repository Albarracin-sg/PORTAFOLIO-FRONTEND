export default function DynamicBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-linear-to-br from-gray-50 via-white to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/20"
      aria-hidden
    />
  );
}
