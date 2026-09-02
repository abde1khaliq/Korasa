export function CalendarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between pb-6">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-xl bg-tag/60" />
          <div className="h-4 w-32 rounded-lg bg-tag/40" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-tag/60" />
      </div>

      <div className="h-80 rounded-2xl bg-paper-card border border-rule/60 p-5" />

      <div className="space-y-3 pt-4">
        <div className="h-20 rounded-2xl bg-paper-card border border-rule/60" />
        <div className="h-20 rounded-2xl bg-paper-card border border-rule/60" />
      </div>
    </div>
  );
}
