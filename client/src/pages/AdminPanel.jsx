// Assigned to: Ian — Day 3 (Admin panel: donor management + hospital verification queue)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Building2, Users, RotateCw, Trash2 } from 'lucide-react'
import api from '../services/api'

export default function AdminPanel() {
  const [hospitals, setHospitals] = useState([])
  const [donors, setDonors] = useState([])
  const [loadingHospitals, setLoadingHospitals] = useState(true)
  const [loadingDonors, setLoadingDonors] = useState(true)
  const [notice, setNotice] = useState(null)

  const loadPending = async () => {
    setLoadingHospitals(true)
    try {
      const res = await api.get('/hospitals', { params: { verified: false } })
      setHospitals(res.data)
    } finally {
      setLoadingHospitals(false)
    }
  }

  const loadDonors = async () => {
    setLoadingDonors(true)
    try {
      const res = await api.get('/donors')
      setDonors(res.data)
    } finally {
      setLoadingDonors(false)
    }
  }

  useEffect(() => {
    loadPending()
    loadDonors()
  }, [])

  const verify = async (id) => {
    await api.put(`/hospitals/${id}/verify`)
    loadPending()
  }

  const recheckAuto = async (id) => {
    const res = await api.post(`/hospitals/${id}/auto-verify`)
    if (res.data.verified) {
      loadPending()
    } else {
      setNotice(res.data.message)
      setTimeout(() => setNotice(null), 4000)
    }
  }

  const removeDonor = async (id) => {
    if (!confirm('Remove this donor account? This cannot be undone.')) return
    await api.delete(`/donors/${id}`)
    loadDonors()
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
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-burgundy-600 transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative">
            <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">Admin</p>
            <h1 className="font-serif text-4xl text-gold-100 flex items-center gap-3">
              <ShieldCheck size={30} strokeWidth={1.5} /> Admin panel
            </h1>
          </div>
        </div>

        {notice && (
          <div className="bg-gold-100 text-gold-700 text-sm font-medium px-4 py-3 rounded-lg mb-6">
            {notice}
          </div>
        )}

        <div className="bg-white rounded-xl border border-ivory-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-medium tracking-widest uppercase text-ink-500 flex items-center gap-1.5">
              <Building2 size={13} /> Hospital verification queue
            </p>
          </div>

          {loadingHospitals ? (
            <p className="text-sm text-ink-400">Loading…</p>
          ) : hospitals.length === 0 ? (
            <p className="text-sm text-ink-500">No hospitals pending verification.</p>
          ) : (
            <div className="space-y-2">
              {hospitals.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-4 rounded-lg border border-ivory-200">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{h.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{h.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => recheckAuto(h.id)}
                      className="h-9 px-3.5 rounded-lg border border-ivory-200 text-ink-600 text-sm font-medium flex items-center gap-1.5 hover:border-gold-500 transition-colors"
                    >
                      <RotateCw size={14} /> Re-check KMHFR
                    </button>
                    <button
                      onClick={() => verify(h.id)}
                      className="h-9 px-3.5 rounded-lg bg-ink-900 text-gold-500 text-sm font-medium hover:bg-burgundy-950 transition-colors"
                    >
                      Approve manually
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-ivory-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-medium tracking-widest uppercase text-ink-500 flex items-center gap-1.5">
              <Users size={13} /> Available donors
            </p>
          </div>

          {loadingDonors ? (
            <p className="text-sm text-ink-400">Loading…</p>
          ) : donors.length === 0 ? (
            <p className="text-sm text-ink-500">No available donors found.</p>
          ) : (
            <div className="space-y-2">
              {donors.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border border-ivory-200">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{d.full_name || d.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{d.blood_type} · {d.city}</p>
                  </div>
                  <button
                    onClick={() => removeDonor(d.id)}
                    className="h-9 px-3.5 rounded-lg border border-ivory-200 text-burgundy-600 text-sm font-medium flex items-center gap-1.5 hover:border-burgundy-300 transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}