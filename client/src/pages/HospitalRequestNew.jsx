// Assigned to: Ian — Day 2 (Hospital requests list + create request form)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplet, AlertTriangle } from 'lucide-react'
import api from '../services/api'

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

const inputClass =
  'w-full h-11 rounded-lg border border-ivory-200 bg-ivory-50 px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500'

export default function HospitalRequestNew() {
  const [form, setForm] = useState({ blood_type: 'O+', units_needed: 1, urgency_level: 'medium' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/requests', form)
      navigate(`/hospital/requests/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-50">
      <div className="border-b border-ivory-200 bg-white">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-burgundy-900 flex items-center justify-center">
              <span className="text-burgundy-900 text-base leading-none">♦</span>
            </div>
            <span className="text-xs font-medium tracking-widest uppercase text-burgundy-900">
              Community Blood Network
            </span>
          </div>
          <Link to="/hospital/requests" className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-burgundy-600 transition-colors">
            <ArrowLeft size={16} /> Requests
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative">
            <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">New request</p>
            <h1 className="font-serif text-4xl text-gold-100">Request blood units</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ivory-200 p-8 space-y-6">
          <div>
            <label className="text-xs font-medium text-ink-500 tracking-wide uppercase flex items-center gap-1.5 mb-2">
              <Droplet size={13} /> Blood type needed
            </label>
            <select name="blood_type" value={form.blood_type} onChange={update} className={inputClass}>
              {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 tracking-wide uppercase block mb-2">
              Units needed
            </label>
            <input name="units_needed" type="number" min="1" value={form.units_needed} onChange={update} className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500 tracking-wide uppercase flex items-center gap-1.5 mb-2">
              <AlertTriangle size={13} /> Urgency level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'critical'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, urgency_level: level }))}
                  className={`h-11 rounded-lg text-sm font-medium capitalize transition-colors ${
                    form.urgency_level === level
                      ? level === 'critical'
                        ? 'bg-burgundy-700 text-white'
                        : 'bg-ink-900 text-gold-500'
                      : 'bg-ivory-50 border border-ivory-200 text-ink-600 hover:border-gold-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-burgundy-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-lg bg-ink-900 text-gold-500 text-sm font-medium tracking-wide hover:bg-burgundy-950 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Creating…' : 'CREATE REQUEST'}
          </button>
        </form>

      </div>
    </div>
  )
}