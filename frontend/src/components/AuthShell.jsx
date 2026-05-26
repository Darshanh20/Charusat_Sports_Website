function AuthShell({ eyebrow, title, description, children }) {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.18),_transparent_24%)]" />
      <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-between rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 sm:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">{eyebrow}</p>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">{description}</p>
            </div>
          </section>
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}

export default AuthShell