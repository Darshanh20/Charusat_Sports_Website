function AuthButton({ children, loading, disabled = false, type = 'submit' }) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Please wait
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default AuthButton