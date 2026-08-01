#REHEMA
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function DonationHistory() {
  const [donations, setDonations] = useState([])

  useEffect(() => {
    api.get('/donations/me').then((res) => setDonations(res.data))
  }, [])

  return (
    <div className="page">
      <h1>Donation History</h1>
      {donations.length === 0 ? (
        <p>No donations logged yet.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Date</th><th>Units</th><th>Location</th></tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.donation_date).toLocaleDateString()}</td>
                <td>{d.units_donated}</td>
                <td>{d.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
