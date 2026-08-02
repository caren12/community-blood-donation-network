// Assigned to: Rehema — Day 1 (Auth context + login/register/forgot/reset-password pages)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

const inputClass =
  'w-full h-11 rounded-lg border border-ivory-200 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500'

export default function Register() {
  const [role, setRole] = useState('donor')
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', blood_type: '' })
  const [hospitalForm, setHospitalForm] = useState({ hospital_name: '', hospital_address: '', hospital_phone: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (setter) => (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = { ...form, role, ...(role === 'hospital_staff' ? hospitalForm : {}) }
      await register(payload)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">

      <div className="hidden md:flex relative flex-col justify-center bg-burgundy-900 text-gold-100 p-16 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-burgundy-800" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-burgundy-800/60" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-lg border border-gold-500 flex items-center justify-center">
              <span className="text-gold-500 text-lg leading-none">♦</span>
            </div>
            <span className="text-xs font-medium tracking-widest uppercase text-gold-500">
              Community Blood Network
            </span>
          </div>
          <p className="font-serif text-5xl leading-tight max-w-lg">
            Join a network that saves lives, one match at a time.
          </p>
          <div className="w-16 h-px bg-gold-500 mt-8" />
        </div>

        <div className="relative max-w-md mt-20">
          <p className="font-serif italic text-lg leading-relaxed text-gold-300 mb-5">
            "We filled an O-negative request in 40 minutes flat. This platform changed how our blood bank operates."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-500 flex items-center justify-center text-xs font-medium text-gold-500">
              AY
            </div>
            <div>
              <p className="text-sm font-medium text-gold-100">Dr. Amina Yusuf</p>
              <p className="text-xs text-gold-500">Nairobi General Hospital</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-ivory-50 flex items-center justify-center p-8 py-14">
        <div className="max-w-sm w-full">
          <p className="font-serif text-3xl text-ink-900 mb-1.5">Create your account</p>
          <p className="text-sm text-ink-500 mb-7">Join as a donor or register your hospital.</p>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-ivory-100 mb-7">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`h-9 rounded-md text-sm font-medium transition-colors ${
                role === 'donor' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
              }`}
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => setRole('hospital_staff')}
              className={`h-9 rounded-md text-sm font-medium transition-colors ${
                role === 'hospital_staff' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
              }`}
            >
              Hospital Staff
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">Full name</label>
              <input name="name" value={form.name} onChange={update(setForm)} required className={inputClass} />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">Email</label>
              <input name="email" type="email" placeholder="name@hospital.org" value={form.email} onChange={update(setForm)} required className={inputClass} />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">Password</label>
              <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={update(setForm)} required className={inputClass} />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">City</label>
              <input name="city" value={form.city} onChange={update(setForm)} required className={inputClass} />
            </div>

            {role === 'donor' && (
              <div>
                <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">Blood type</label>
                <select name="blood_type" value={form.blood_type} onChange={update(setForm)} required className={inputClass}>
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
            )}

            {role === 'hospital_staff' && (
              <>
                <div>
                  <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">Hospital name</label>
                  <input name="hospital_name" value={hospitalForm.hospital_name} onChange={update(setHospitalForm)} required className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">Hospital address</label>
                  <input name="hospital_address" value={hospitalForm.hospital_address} onChange={update(setHospitalForm)} required className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">Hospital phone</label>
                  <input name="hospital_phone" value={hospitalForm.hospital_phone} onChange={update(setHospitalForm)} required className={inputClass} />
                </div>
              </>
            )}

            {error && <p className="text-sm text-burgundy-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-ink-900 text-gold-500 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-burgundy-950 disabled:opacity-60 transition-colors mt-2"
            >
              {submitting ? 'Creating account…' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-burgundy-600 font-medium hover:text-burgundy-900 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}