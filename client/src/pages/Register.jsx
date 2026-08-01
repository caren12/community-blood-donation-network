#IAN
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [role, setRole] = useState('donor')
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', blood_type: '' })
  const [hospitalForm, setHospitalForm] = useState({ hospital_name: '', hospital_address: '', hospital_phone: '' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (setter) => (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, role, ...(role === 'hospital_staff' ? hospitalForm : {}) }
      await register(payload)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      <h1>Register</h1>
      <div className="role-toggle">
        <button type="button" className={role === 'donor' ? 'active' : ''} onClick={() => setRole('donor')}>Donor</button>
        <button type="button" className={role === 'hospital_staff' ? 'active' : ''} onClick={() => setRole('hospital_staff')}>Hospital Staff</button>
      </div>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full name" value={form.name} onChange={update(setForm)} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={update(setForm)} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={update(setForm)} required />
        <input name="city" placeholder="City" value={form.city} onChange={update(setForm)} required />

        {role === 'donor' && (
          <select name="blood_type" value={form.blood_type} onChange={update(setForm)} required>
            <option value="">Blood type</option>
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        )}

        {role === 'hospital_staff' && (
          <>
            <input name="hospital_name" placeholder="Hospital name" value={hospitalForm.hospital_name} onChange={update(setHospitalForm)} required />
            <input name="hospital_address" placeholder="Hospital address" value={hospitalForm.hospital_address} onChange={update(setHospitalForm)} required />
            <input name="hospital_phone" placeholder="Hospital phone" value={hospitalForm.hospital_phone} onChange={update(setHospitalForm)} required />
          </>
        )}

        {error && <p className="error">{error}</p>}
        <button type="submit">Create account</button>
      </form>
    </div>
  )
}
