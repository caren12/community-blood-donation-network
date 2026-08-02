// Assigned to: Victor — Day 1 (Set up React app + Router + index.html shell)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, HeartPulse, History, ClipboardList, PlusCircle, ShieldCheck, ArrowRight } from 'lucide-react'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [donor, setDonor] = useState(null)

  useEffect(() => {
    if (user?.role === 'donor') {
      api.get('/donors/me').then((res) => setDonor(res.data)).catch(() => {})
    }
  }, [user])

  const donorLinks = [
    {
      to: '/donor/profile',
      label: 'My profile',
      Icon: User,
      detail: donor ? (
        <span className="text-xs text-ink-500">
          {donor.blood_type} · {donor.is_available ? 'Available to donate' : 'Not available'}
        </span>
      ) : (
        <span className="text-xs text-ink-500">Update your blood type, city, and availability</span>
      ),
    },
    { to: '/donor/matches', label: 'My matches', Icon: HeartPulse, detail: <span className="text-xs text-ink-500">See hospital requests that match your profile</span> },
    { to: '/donor/history', label: 'Donation history', Icon: History, detail: <span className="text-xs text-ink-500">Track your past donations</span> },
  ]

  const hospitalLinks = [
    { to: '/hospital/requests', label: 'Blood requests', Icon: ClipboardList, detail: <span className="text-xs text-ink-500">View and manage your requests</span> },
    { to: '/hospital/requests/new', label: 'New request', Icon: PlusCircle, detail: <span className="text-xs text-ink-500">Submit a new blood donation request</span> },
  ]

  const adminLinks = [
    { to: '/admin/hospitals', label: 'Admin panel', Icon: ShieldCheck, detail: <span className="text-xs text-ink-500">Manage donors, hospitals, and requests</span> },
  ]

  const links = user?.role === 'donor' ? donorLinks : user?.role === 'hospital_staff' ? hospitalLinks : adminLinks

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
          <button
            onClick={logout}
            className="h-9 px-4 rounded-lg border border-ivory-200 text-ink-700 text-sm font-medium hover:border-burgundy-600 hover:text-burgundy-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">

        <div className="relative overflow-hidden rounded-2xl bg-burgundy-900 px-10 py-9 mb-10">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-burgundy-800" />
          <div className="relative flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-gold-500 mb-2">Welcome back</p>
              <h1 className="font-serif text-4xl text-gold-100">{user?.full_name || user?.name}</h1>
            </div>
            {donor && (
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-gold-500 uppercase tracking-wide mb-1">Blood type</p>
                  <p className="text-xl font-medium text-gold-100">{donor.blood_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gold-500 uppercase tracking-wide mb-1">Status</p>
                  <p className="text-xl font-medium text-gold-100">{donor.is_available ? 'Available' : 'Unavailable'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs font-medium tracking-widest uppercase text-ink-500 mb-4">Quick actions</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map(({ to, label, Icon, detail }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-start gap-4 p-6 rounded-xl border border-ivory-200 bg-white hover:border-gold-500 hover:shadow-lg hover:shadow-burgundy-950/5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 shrink-0 rounded-lg bg-burgundy-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
                <Icon size={20} className="text-burgundy-700" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-900 mb-1">{label}</p>
                {detail}
              </div>
              <ArrowRight size={16} className="text-ink-400 mt-1 group-hover:text-burgundy-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}