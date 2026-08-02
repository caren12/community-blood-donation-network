// Assigned to: Rehema — Day 2 (Donor profile page)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Droplet, MapPin, CheckCircle2 } from 'lucide-react'
import api from '../services/api'

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

export default function DonorProfile() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/donors/me')
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your profile. Please try again.'))
  }, [])

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await api.put('/donors/me', {
        blood_type: profile.blood_type,
        city: profile.city,
        is_available: profile.is_available,
      })
      setProfile(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-burgundy-700 font-semibold mb-2">Something went wrong</p>
          <p className="text-ink-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <p className="text-ink-400 text-sm">Loading your profile…</p>
      </div>
    )
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
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-burgundy-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">Your profile</p>
              <h1 className="font-serif text-4xl text-gold-100">Keep your details current</h1>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-gold-500 uppercase tracking-wide mb-1">Blood type</p>
                <p className="text-xl font-medium text-gold-100">{profile.blood_type}</p>
              </div>
              <div>
                <p className="text-xs text-gold-500 uppercase tracking-wide mb-1">Status</p>
                <p className="text-xl font-medium text-gold-100">{profile.is_available ? 'Available' : 'Unavailable'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-ivory-200 overflow-hidden">

          <div className="p-8 border-b border-ivory-200">
            <p className="text-xs font-medium tracking-widest uppercase text-ink-500 mb-5">Donor details</p>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-ink-500 tracking-wide uppercase flex items-center gap-1.5 mb-2">
                  <Droplet size={13} /> Blood type
                </label>
                <select
                  value={profile.blood_type || ''}
                  onChange={(e) => update('blood_type', e.target.value)}
                  className="w-full h-11 rounded-lg border border-ivory-200 bg-ivory-50 px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500"
                >
                  {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-500 tracking-wide uppercase flex items-center gap-1.5 mb-2">
                  <MapPin size={13} /> City
                </label>
                <input
                  value={profile.city || ''}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full h-11 rounded-lg border border-ivory-200 bg-ivory-50 px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          <div className="p-8">
            <p className="text-xs font-medium tracking-widest uppercase text-ink-500 mb-5">Donation preferences</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-900">Available to donate</p>
                <p className="text-xs text-ink-500 mt-0.5">Hospitals can match you to compatible requests</p>
              </div>
              <button
                type="button"
                onClick={() => update('is_available', !profile.is_available)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  profile.is_available ? 'bg-burgundy-700' : 'bg-ivory-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    profile.is_available ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {error && <p className="text-burgundy-700 text-sm px-8 pb-4">{error}</p>}

          <div className="flex items-center gap-4 px-8 pb-8">
            <button
              onClick={save}
              disabled={saving}
              className="h-11 px-6 rounded-lg bg-ink-900 text-gold-500 text-sm font-medium tracking-wide hover:bg-burgundy-950 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>

            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-700">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}