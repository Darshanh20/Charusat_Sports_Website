import { Link } from 'react-router-dom'

function Breadcrumbs({ items = [], className = '' }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-3 text-sm text-slate-500 ${className}`}>
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} className="inline-flex items-center gap-3">
            {it.to && !isLast ? (
              <Link to={it.to} className="text-emerald-600 font-semibold hover:underline">
                {it.label}
              </Link>
            ) : (
              <span className={`font-semibold ${isLast ? 'text-slate-700' : 'text-slate-500'}`}>{it.label}</span>
            )}
            {!isLast ? <span className="text-slate-400">→</span> : null}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
