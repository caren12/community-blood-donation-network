// Assigned to: Rehema — Day 2 (Donor matches page) + real-time WebSocket updates
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, HeartPulse, Radio, MapPin } from 'lucide-react'
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

export default function DonorMatches() {
  const [matches, setMatches] = useState([])
  const [liveBanner, setLiveBanner] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMatches = async () => {
  try {
    const res = await api.get('/matches/mine')
    setMatches(res.data)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadMatches()

    const socket = connectSocket()
    if (!socket) return

    socket.on('new_match', (match) => {
      setMatches((prev) => [match, ...prev])
      setLiveBanner(`New match: ${match.hospital_name} needs ${match.blood_type} blood`)
      setTimeout(() => setLiveBanner(null), 6000)
    })

    return () => {
      socket.off('new_match')
    }
  }, [])

  const respond = async (matchId, response_status) => {
    try {
      const res = await api.put(`/matches/${matchId}/respond`, { response_status })
      setMatches((prev) => prev.map((m) => (m.id === matchId ? res.data : m)))
    } catch (err) {
      console.error(err)
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
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-burgundy-600 transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">

        {liveBanner && (
          <div className="flex items-center gap-2 bg-gold-100 text-gold-700 text-sm font-medium px-4 py-3 rounded-lg mb-6">
            <Radio size={15} /> {liveBanner}
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative">
            <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">Your matches</p>
            <h1 className="font-serif text-4xl text-gold-100">Requests that need you</h1>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink-400">Loading matches…</p>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-xl border border-ivory-200 p-10 text-center">
            <HeartPulse size={28} className="text-ink-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-ink-500">No matches yet — you'll see new emergency requests here in real time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl border border-ivory-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-medium text-ink-900">{match.hospital_name}</p>
                    <p className="text-sm text-ink-500 mt-0.5">Needs {match.blood_type} blood</p>
                  </div>
                  {match.urgency_level && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${URGENCY_STYLES[match.urgency_level] || URGENCY_STYLES.low}`}>
                      {match.urgency_level}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${RESPONSE_STYLES[match.response_status] || RESPONSE_STYLES.pending}`}>
                    {match.response_status}
                  </span>

                  {match.response_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => respond(match.id, 'declined')}
                        className="h-9 px-4 rounded-lg border border-ivory-200 text-ink-600 text-sm font-medium hover:border-burgundy-300 hover:text-burgundy-600 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => respond(match.id, 'accepted')}
                        className="h-9 px-4 rounded-lg bg-ink-900 text-gold-500 text-sm font-medium hover:bg-burgundy-950 transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}