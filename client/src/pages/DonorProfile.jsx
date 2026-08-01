#REHEMA
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function DonorProfile() {
  const [profile, setProfile] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/donors/me').then((res) => setProfile(res.data))
  }, [])

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  const save = async () => {
    const res = await api.put('/donors/me', {
      blood_type: profile.blood_type,
      city: profile.city,
      is_available: profile.is_available,
    })
    setProfile(res.data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return <p>Loading...</p>

  return (
    <div className="page">
      <h1>My Profile</h1>
      <label>
        Blood type
        <select value={profile.blood_type || ''} onChange={(e) => update('blood_type', e.target.value)}>
          {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
        </select>
      </label>
      <label>
        City
        <input value={profile.city || ''} onChange={(e) => update('city', e.target.value)} />
      </label>
      <label className="toggle">
        Available to donate
        <input type="checkbox" checked={profile.is_available} onChange={(e) => update('is_available', e.target.checked)} />
      </label>
      <button onClick={save}>Save</button>
      {saved && <p className="success">Saved!</p>}
    </div>
  )
}
