export const EmptyIllustration = () => {
  return (
    <div className="relative h-[130px] w-[160px]">
      <div className="absolute left-0 top-2 h-[115px] w-[110px] -rotate-6 rounded-xl border border-rule bg-paper-card" />
      <div className="absolute right-0 top-2 h-[115px] w-[110px] rotate-6 rounded-xl border border-rule bg-paper-card" />
      <div className="absolute left-1/2 top-0 h-[125px] w-[120px] -translate-x-1/2 rounded-xl border border-rule bg-paper-card p-5">
        <div className="mt-1 h-[7px] w-[60%] rounded-full bg-tag/70" />
        <div className="mt-3 h-[7px] w-[80%] rounded-full bg-tag/70" />
        <div className="mt-3 h-[7px] w-[52%] rounded-full bg-tag/70" />
        <div className="mt-3 h-[7px] w-[40%] rounded-full bg-tag/70" />
      </div>
    </div>
  );
}