function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-24 rounded-full bg-slate-200" />
        <div className="h-6 w-3/4 rounded-full bg-slate-200" />
        <div className="h-4 w-1/2 rounded-full bg-slate-200" />
        <div className="flex items-center justify-between pt-3">
          <div className="h-8 w-24 rounded-full bg-slate-200" />
          <div className="h-10 w-28 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard