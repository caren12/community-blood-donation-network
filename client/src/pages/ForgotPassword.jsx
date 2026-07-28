import { useState } from 'react'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await api.post('/auth/forgot-password', { email })
    setMessage(res.data.message)
  }

  return (
    <div className="auth-page">
      <h1>Forgot password</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Send reset link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
