import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AuthButton from '../components/AuthButton'
import AuthField from '../components/AuthField'
import AuthShell from '../components/AuthShell'
import { decodeToken, getRedirectPathForRole } from '../utils/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => form.email.trim() && form.password.trim(), [form])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setServerError('')

    try {
      const response = await api.post('/auth/login', form)
      localStorage.setItem('token', response.data.token)
      const decoded = decodeToken(response.data.token)
      navigate(getRedirectPathForRole(decoded?.role), { replace: true })
    } catch (error) {
      const responseErrors = error?.response?.data?.errors || {}
      setErrors((current) => ({ ...current, ...responseErrors }))
      setServerError(error?.response?.data?.message || 'Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="CHARUSAT Sports"
      title="Sign in to manage your facility bookings"
      description="Use your university or organisation account to access the booking platform and move directly to the right dashboard."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
          <p className="mt-2 text-sm text-slate-600">Enter your email address and password to continue.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <AuthField label="Email" error={errors.email}>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
            />
          </AuthField>

          <AuthField label="Password" error={errors.password}>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
            />
          </AuthField>

          {serverError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p> : null}

          <AuthButton loading={loading}>Login</AuthButton>
          <p className="text-sm text-slate-600">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-slate-900 underline underline-offset-4">
              Create an account
            </Link>
          </p>
          {!canSubmit ? <p className="text-xs text-slate-500">Fill in both fields to continue.</p> : null}
        </form>
      </div>
    </AuthShell>
  )
}

export default LoginPage