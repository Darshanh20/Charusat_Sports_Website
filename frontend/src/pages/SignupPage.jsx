import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AuthButton from '../components/AuthButton'
import AuthField from '../components/AuthField'
import AuthShell from '../components/AuthShell'
import { decodeToken, getRedirectPathForRole } from '../utils/auth'

const defaultInternal = {
  full_name: '',
  university_id: '',
  department: 'Computer Science',
  email: '',
  password: '',
  confirm_password: '',
  terms: false,
}

const defaultExternal = {
  full_name: '',
  org_name: '',
  gst_number: '',
  contact_person: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  terms: false,
}

const departmentOptions = ['Computer Science', 'Information Technology', 'Mechanical', 'Civil', 'Electrical']

function SignupPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('internal')
  const [internalForm, setInternalForm] = useState(defaultInternal)
  const [externalForm, setExternalForm] = useState(defaultExternal)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const activeForm = role === 'internal' ? internalForm : externalForm

  const passwordsMatch = activeForm.password.trim() && activeForm.confirm_password.trim() && activeForm.password === activeForm.confirm_password
  const canSubmit = useMemo(() => passwordsMatch, [passwordsMatch])

  const requiredError = (value) => (value.trim() ? '' : 'This field is required')

  const validateCurrentField = (name, value, formState = activeForm) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : value

    switch (name) {
      case 'full_name':
        return requiredError(value)
      case 'university_id':
        return role === 'internal' ? requiredError(value) : ''
      case 'department':
        return role === 'internal' ? requiredError(value) : ''
      case 'org_name':
        return role === 'external' ? requiredError(value) : ''
      case 'gst_number':
        return role === 'external' ? requiredError(value) : ''
      case 'contact_person':
        return role === 'external' ? requiredError(value) : ''
      case 'email':
        if (!trimmedValue) {
          return 'This field is required'
        }

        if (role === 'internal' && !trimmedValue.endsWith('@charusat.edu.in')) {
          return 'Please use your CHARUSAT university email'
        }

        return ''
      case 'phone':
        if (role !== 'external') {
          return ''
        }

        if (!trimmedValue) {
          return 'This field is required'
        }

        return /^[6-9]\d{9}$/.test(trimmedValue) ? '' : 'Enter a valid 10-digit mobile number'
      case 'password':
        if (!trimmedValue) {
          return 'This field is required'
        }

        return trimmedValue.length >= 8 ? '' : 'Password must be at least 8 characters'
      case 'confirm_password':
        if (!trimmedValue) {
          return 'This field is required'
        }

        return formState.password && formState.confirm_password && formState.password === formState.confirm_password ? '' : 'Passwords do not match'
      case 'terms':
        return value ? '' : 'This field is required'
      default:
        return ''
    }
  }

  const validateForm = () => {
    const nextErrors = {
      full_name: validateCurrentField('full_name', activeForm.full_name),
      email: validateCurrentField('email', activeForm.email),
      password: validateCurrentField('password', activeForm.password),
      confirm_password: validateCurrentField('confirm_password', activeForm.confirm_password),
      terms: validateCurrentField('terms', activeForm.terms),
    }

    if (role === 'internal') {
      nextErrors.university_id = validateCurrentField('university_id', activeForm.university_id)
      nextErrors.department = validateCurrentField('department', activeForm.department)
    }

    if (role === 'external') {
      nextErrors.org_name = validateCurrentField('org_name', activeForm.org_name)
      nextErrors.gst_number = validateCurrentField('gst_number', activeForm.gst_number)
      nextErrors.contact_person = validateCurrentField('contact_person', activeForm.contact_person)
      nextErrors.phone = validateCurrentField('phone', activeForm.phone)
    }

    setErrors(nextErrors)
    return Object.values(nextErrors).every((error) => !error)
  }

  const setFormValue = (name, value) => {
    if (role === 'internal') {
      setInternalForm((current) => ({ ...current, [name]: value }))
    } else {
      setExternalForm((current) => ({ ...current, [name]: value }))
    }

    setErrors((current) => ({ ...current, [name]: '' }))
    setServerError('')
  }

  const handleBlur = (name) => {
    setErrors((current) => ({
      ...current,
      [name]: validateCurrentField(name, activeForm[name], activeForm),
    }))
  }

  const handlePasswordChange = (value) => {
    setFormValue('password', value)
    setErrors((current) => ({
      ...current,
      password: validateCurrentField('password', value),
      confirm_password: activeForm.confirm_password
        ? value === activeForm.confirm_password
          ? ''
          : 'Passwords do not match'
        : current.confirm_password,
    }))
  }

  const handleConfirmPasswordChange = (value) => {
    setFormValue('confirm_password', value)
    setErrors((current) => ({
      ...current,
      confirm_password: value ? (activeForm.password === value ? '' : 'Passwords do not match') : 'This field is required',
    }))
  }

  const handlePhoneKeyDown = (event) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault()
    }
  }

  const validate = () => {
    return validateForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setServerError('')

    const payload = {
      role,
      ...activeForm,
    }

    delete payload.terms

    try {
      const response = await api.post('/auth/register', payload)
      localStorage.setItem('token', response.data.token)
      const decoded = decodeToken(response.data.token)
      navigate(getRedirectPathForRole(decoded?.role), { replace: true })
    } catch (error) {
      const responseErrors = error?.response?.data?.errors || {}
      setErrors((current) => ({ ...current, ...responseErrors }))
      setServerError(error?.response?.data?.message || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900'

  return (
    <AuthShell
      eyebrow="CHARUSAT Sports"
      title="Create your booking account"
      description="Internal members and external organisations get tailored access to the same sports facility booking platform."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Signup</h2>
          <p className="mt-2 text-sm text-slate-600">Choose the account type and complete the matching form fields.</p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setRole('internal')}
            className={`rounded-xl px-4 py-3 transition ${role === 'internal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Internal Member
          </button>
          <button
            type="button"
            onClick={() => setRole('external')}
            className={`rounded-xl px-4 py-3 transition ${role === 'external' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            External Organization
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <AuthField label="Full Name" error={errors.full_name}>
            <input
              value={activeForm.full_name}
              onChange={(event) => setFormValue('full_name', event.target.value)}
              onBlur={() => handleBlur('full_name')}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </AuthField>

          {role === 'internal' ? (
            <>
              <AuthField label="University ID" error={errors.university_id}>
                <input
                  value={activeForm.university_id}
                  onChange={(event) => setFormValue('university_id', event.target.value)}
                  onBlur={() => handleBlur('university_id')}
                  placeholder="Enter your university ID"
                  className={inputClass}
                />
              </AuthField>

              <AuthField label="Department" error={errors.department}>
                <select
                  value={activeForm.department}
                  onChange={(event) => setFormValue('department', event.target.value)}
                  onBlur={() => handleBlur('department')}
                  className={inputClass}
                >
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </AuthField>

              <AuthField label="University Email" error={errors.email}>
                <input
                  type="email"
                  value={activeForm.email}
                  onChange={(event) => setFormValue('email', event.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@charusat.edu.in"
                  className={inputClass}
                />
              </AuthField>
            </>
          ) : (
            <>
              <AuthField label="Organisation Name" error={errors.org_name}>
                <input
                  value={activeForm.org_name}
                  onChange={(event) => setFormValue('org_name', event.target.value)}
                  onBlur={() => handleBlur('org_name')}
                  placeholder="Enter organisation name"
                  className={inputClass}
                />
              </AuthField>

              <AuthField label="GST Number" error={errors.gst_number}>
                <input
                  value={activeForm.gst_number}
                  onChange={(event) => setFormValue('gst_number', event.target.value)}
                  onBlur={() => handleBlur('gst_number')}
                  placeholder="Enter GST number"
                  className={inputClass}
                />
              </AuthField>

              <AuthField label="Contact Person Name" error={errors.contact_person}>
                <input
                  value={activeForm.contact_person}
                  onChange={(event) => setFormValue('contact_person', event.target.value)}
                  onBlur={() => handleBlur('contact_person')}
                  placeholder="Enter contact person name"
                  className={inputClass}
                />
              </AuthField>

              <AuthField label="Email" error={errors.email}>
                <input
                  type="email"
                  value={activeForm.email}
                  onChange={(event) => setFormValue('email', event.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="org@example.com"
                  className={inputClass}
                />
              </AuthField>

              <AuthField label="Phone" error={errors.phone}>
                <input
                  value={activeForm.phone}
                  onChange={(event) => setFormValue('phone', event.target.value)}
                  onBlur={() => handleBlur('phone')}
                  onKeyDown={handlePhoneKeyDown}
                  placeholder="Enter phone number"
                  className={inputClass}
                />
              </AuthField>
            </>
          )}

          <AuthField label="Password" error={errors.password}>
            <input
              type="password"
              value={activeForm.password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Create a password"
              className={inputClass}
            />
          </AuthField>

          <AuthField label="Confirm Password" error={errors.confirm_password}>
            <input
              type="password"
              value={activeForm.confirm_password}
              onChange={(event) => handleConfirmPasswordChange(event.target.value)}
              onBlur={() => handleBlur('confirm_password')}
              placeholder="Re-enter your password"
              className={inputClass}
            />
          </AuthField>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={activeForm.terms}
              onChange={(event) => setFormValue('terms', event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
            />
            <span>I agree to the terms and conditions for using the CHARUSAT sports booking platform.</span>
          </label>
          {errors.terms ? <p className="text-sm text-red-600">{errors.terms}</p> : null}

          {serverError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p> : null}

          <AuthButton loading={loading} disabled={!canSubmit}>
            Create Account
          </AuthButton>
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 underline underline-offset-4">
              Login here
            </Link>
          </p>
          {!canSubmit ? <p className="text-xs text-slate-500">Complete the required fields to submit.</p> : null}
        </form>
      </div>
    </AuthShell>
  )
}

export default SignupPage