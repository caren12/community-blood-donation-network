// Assigned to: Ian — Day 2 (Request detail page + matched donors view)
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Droplet, Users, Radio } from 'lucide-react'
import api from '../services/api'
import { connectSocket } from '../services/socket'

const URGENCY_STYLES = {
  critical: 'bg-burgundy-700 text-white',
  medium: 'bg-gold-100 text-gold-700',
  low: 'bg-ivory-100 text-ink-500',
}

const RESPONSE_STYLES = {
  pending: 'bg-ivory-100 text-ink-500',
  accepted: 'bg-green-50 text-green-700 border border-green-200',
  declined: 'bg-burgundy-50 text-burgundy-600 border border-burgundy-100',
}

export default function HospitalRequestDetail() {
  const { id } = useParams()
  const [req, setReq] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [liveUpdate, setLiveUpdate] = useState(null)
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    api.get(`/requests/${id}`).then((res) => setReq(res.data))

    const socket = connectSocket()
    if (socket) {
      socket.on('match_response', (match) => {
        setLiveUpdate(`${match.donor_name} ${match.response_status} the request`)
        setTimeout(() => setLiveUpdate(null), 6000)
      })
    }
    return () => socket && socket.off('match_response')
  }, [id])

  const runMatching = async () => {
    setMatching(true)
    try {
      const res = await api.post(`/requests/${id}/match`)
      setMatchResult(res.data)
    } finally {
      setMatching(false)
    }
  }

  if (!req) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <p className="text-sm text-ink-400">Loading request…</p>
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
          <Link to="/hospital/requests" className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-burgundy-600 transition-colors">
            <ArrowLeft size={16} /> Requests
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">

        {liveUpdate && (
          <div className="flex items-center gap-2 bg-gold-100 text-gold-700 text-sm font-medium px-4 py-3 rounded-lg mb-6">
            <Radio size={15} /> {liveUpdate}
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">Request #{req.id}</p>
              <h1 className="font-serif text-4xl text-gold-100 flex items-center gap-3">
                <Droplet size={30} strokeWidth={1.5} /> {req.blood_type} · {req.units_needed} units
              </h1>
            </div>
            <div className="flex gap-3">
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${URGENCY_STYLES[req.urgency_level] || URGENCY_STYLES.low}`}>
                {req.urgency_level}
              </span>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full capitalize bg-gold-500 text-burgundy-950">
                {req.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-ivory-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-medium tracking-widest uppercase text-ink-500 flex items-center gap-1.5">
              <Users size={13} /> Matched donors
            </p>
            <button
              onClick={runMatching}
              disabled={matching}
              className="h-10 px-4 rounded-lg bg-ink-900 text-gold-500 text-sm font-medium hover:bg-burgundy-950 disabled:opacity-60 transition-colors"
            >
              {matching ? 'Searching…' : 'Find matching donors'}
            </button>
          </div>

          {matchResult ? (
            <>
              <p className="text-sm text-ink-500 mb-4">
                {matchResult.matches_created} donor(s) matched and notified in real time.
              </p>
              <div className="space-y-2">
                {matchResult.matches.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 rounded-lg border border-ivory-200">
                    <span className="text-sm font-medium text-ink-900">{m.donor_name || `Donor #${m.donor_id}`}</span>
                    {m.distance_km != null && (
                      <span className="text-xs text-ink-500">{m.distance_km.toFixed(1)} km away</span>
                    )}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${RESPONSE_STYLES[m.response_status] || RESPONSE_STYLES.pending}`}>
                      {m.response_status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-400">No matching run yet for this request.</p>
          )}
        </div>

      </div>
    </div>
  )
}
