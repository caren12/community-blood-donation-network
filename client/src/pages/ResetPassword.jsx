#IAN
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/reset-password', { token, password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    }
  }

  return (
    <div className="auth-page">
      <h1>Reset password</h1>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Reset password</button>
      </form>
    </div>
  )
}
