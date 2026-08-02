// Assigned to: Rehema — Day 3 (Donation history page)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, History, Droplet, MapPin, Calendar } from 'lucide-react'
import api from '../services/api'

export default function DonationHistory() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/donations/me')
      .then((res) => setDonations(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your donation history.'))
      .finally(() => setLoading(false))
  }, [])

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

      <div className="max-w-3xl mx-auto px-8 py-12">

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative">
            <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">Your history</p>
            <h1 className="font-serif text-4xl text-gold-100">Donation history</h1>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink-400">Loading your donation history…</p>
        ) : error ? (
          <div className="bg-white rounded-xl border border-ivory-200 p-10 text-center">
            <p className="text-sm text-burgundy-600">{error}</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-xl border border-ivory-200 p-10 text-center">
            <History size={28} className="text-ink-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-ink-500">No donations logged yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-ivory-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ivory-200 bg-ivory-50">
                  <th className="text-left font-medium text-ink-500 text-xs uppercase tracking-wide px-6 py-3">
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> Date</span>
                  </th>
                  <th className="text-left font-medium text-ink-500 text-xs uppercase tracking-wide px-6 py-3">
                    <span className="flex items-center gap-1.5"><Droplet size={13} /> Units</span>
                  </th>
                  <th className="text-left font-medium text-ink-500 text-xs uppercase tracking-wide px-6 py-3">
                    <span className="flex items-center gap-1.5"><MapPin size={13} /> Location</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b border-ivory-100 last:border-0 hover:bg-ivory-50/50 transition-colors">
                    <td className="px-6 py-4 text-ink-900">{new Date(d.donation_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-ink-900">{d.units_donated}</td>
                    <td className="px-6 py-4 text-ink-700">{d.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}