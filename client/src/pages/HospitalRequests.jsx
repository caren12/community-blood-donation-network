// Assigned to: Ian — Day 2 (Hospital requests list + create request form)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Droplet, Search } from 'lucide-react'
import api from '../services/api'

const URGENCY_STYLES = {
  critical: 'bg-burgundy-700 text-white',
  medium: 'bg-gold-100 text-gold-700',
  low: 'bg-ivory-100 text-ink-500',
}

const STATUS_STYLES = {
  open: 'bg-green-50 text-green-700 border border-green-200',
  fulfilled: 'bg-ink-50 text-ink-500 border border-ivory-200',
  expired: 'bg-ivory-100 text-ink-400 border border-ivory-200',
}

export default function HospitalRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    api.get('/requests')
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch = r.blood_type.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
          <Link to="/dashboard" className="text-sm text-ink-700 hover:text-burgundy-600 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10 flex items-center justify-between flex-wrap gap-6">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative">
            <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">Requests</p>
            <h1 className="font-serif text-4xl text-gold-100">Our blood requests</h1>
          </div>
          <Link
            to="/hospital/requests/new"
            className="relative h-11 px-5 rounded-lg bg-gold-500 text-burgundy-950 text-sm font-medium flex items-center gap-2 hover:bg-gold-300 transition-colors"
          >
            <Plus size={16} /> New request
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by blood type…"
              className="w-full h-10 rounded-lg border border-ivory-200 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'open', 'fulfilled', 'expired'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`h-10 px-3.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  statusFilter === s ? 'bg-ink-900 text-gold-500' : 'bg-white border border-ivory-200 text-ink-600 hover:border-gold-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink-400">Loading requests…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-ivory-200 p-10 text-center">
            <p className="text-sm text-ink-500">No requests found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <Link
                key={r.id}
                to={`/hospital/requests/${r.id}`}
                className="flex items-center gap-5 p-5 rounded-xl border border-ivory-200 bg-white hover:border-gold-500 hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 shrink-0 rounded-lg bg-burgundy-50 flex items-center justify-center">
                  <Droplet size={20} className="text-burgundy-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink-900">{r.blood_type} · {r.units_needed} units</p>
                  <p className="text-xs text-ink-500 mt-0.5">Request #{r.id}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${URGENCY_STYLES[r.urgency_level] || URGENCY_STYLES.low}`}>
                  {r.urgency_level}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[r.status] || STATUS_STYLES.expired}`}>
                  {r.status}
                </span>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}