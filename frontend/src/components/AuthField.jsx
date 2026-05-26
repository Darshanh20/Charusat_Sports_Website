function AuthField({ label, error, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </label>
  )
}

export default AuthField