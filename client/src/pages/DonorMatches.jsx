#REHEMA
import { useEffect, useState } from 'react'
import api from '../services/api'
import { connectSocket } from '../services/socket'

export default function DonorMatches() {
  const [matches, setMatches] = useState([])
  const [liveBanner, setLiveBanner] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMatches = async () => {
    try {
      setLoading(false)
    } catch (err) {
      console.error(err)
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
    <div className="page">
      <h1>Your Matches</h1>

      {liveBanner && <div className="live-banner">{liveBanner}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p>No matches yet — you'll see new emergency requests here in real time.</p>
      ) : (
        <ul className="match-list">
          {matches.map((match) => (
            <li key={match.id} className="match-card">
              <div>
                <strong>{match.hospital_name}</strong> needs {match.blood_type} blood
                {match.urgency_level && <span className={`urgency urgency-${match.urgency_level}`}> · {match.urgency_level}</span>}
              </div>
              <div className="match-status">Status: {match.response_status}</div>
              {match.response_status === 'pending' && (
                <div className="match-actions">
                  <button onClick={() => respond(match.id, 'accepted')}>Accept</button>
                  <button onClick={() => respond(match.id, 'declined')}>Decline</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
