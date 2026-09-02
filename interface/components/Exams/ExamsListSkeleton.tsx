export function ExamsListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-40 rounded-xl bg-tag/60 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-44 rounded-2xl bg-paper-card border border-rule/60 p-5" />
        <div className="h-44 rounded-2xl bg-paper-card border border-rule/60 p-5" />
        <div className="h-44 rounded-2xl bg-paper-card border border-rule/60 p-5" />
      </div>
    </div>
  );
}
