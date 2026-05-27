function SocialIcon({ children, href, label }) {
  return (
    <a href={href} aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700">
      {children}
    </a>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_1fr_0.95fr] lg:px-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16" />
                <path d="M12 4v16" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">CHARUSAT Sports</p>
              <p className="text-xs text-slate-500">Fostering excellence in sports</p>
            </div>
          </div>
          <p className="max-w-sm text-sm text-slate-600">Changa, Anand, Gujarat 388421</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Links</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><a href="/facilities" className="hover:text-emerald-700">Find Facility</a></li>
              <li><a href="/facilities" className="hover:text-emerald-700">Booking Rules</a></li>
              <li><a href="/facilities" className="hover:text-emerald-700">Tournament Calendar</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Support</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><a href="/facilities" className="hover:text-emerald-700">Contact Us</a></li>
              <li><a href="/facilities" className="hover:text-emerald-700">FAQs</a></li>
              <li><a href="/facilities" className="hover:text-emerald-700">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Connect With Us</p>
          <div className="mt-4 flex items-center gap-3">
            <SocialIcon href="https://facebook.com" label="Facebook">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M13.5 8H15V5h-1.5C11.57 5 10 6.57 10 8.5V10H8v3h2v6h3v-6h2.1l.4-3H13V8.75c0-.41.34-.75.75-.75Z" /></svg>
            </SocialIcon>
            <SocialIcon href="https://instagram.com" label="Instagram">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Zm5.5-2.3a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" /></svg>
            </SocialIcon>
            <SocialIcon href="https://youtube.com" label="YouTube">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" /></svg>
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer