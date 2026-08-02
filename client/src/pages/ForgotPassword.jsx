// Assigned to: Rehema — Day 1 (Auth context + login/register/forgot/reset-password pages)
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data.message)
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
            Every donation is someone's second chance.
          </p>
          <div className="w-16 h-px bg-gold-500 mt-8" />
        </div>
      </div>

      <div className="bg-ivory-50 flex items-center justify-center p-8">
        <div className="max-w-xs w-full">
          <p className="font-serif text-3xl text-ink-900 mb-1.5">Forgot password</p>
          <p className="text-sm text-ink-500 mb-9">
            Enter your email and we'll send you a link to reset it.
          </p>

          {message ? (
            <div className="bg-gold-100 text-gold-700 text-sm font-medium px-4 py-3 rounded-lg">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 rounded-lg border border-ivory-200 bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-ink-900 text-gold-500 text-sm font-medium tracking-wide hover:bg-burgundy-950 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Sending…' : 'SEND RESET LINK'}
              </button>
            </form>
          )}

          <p className="text-sm text-ink-500 text-center mt-7">
            Remembered it?{' '}
            <Link to="/login" className="text-burgundy-600 font-medium hover:text-burgundy-900 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}