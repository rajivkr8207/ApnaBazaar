import { useEffect, useState, useRef } from 'react'
import { useNavigate }                 from 'react-router'
import useAuth                         from '../hooks/UseAuth'
import InputField                      from '../../../components/common/Inputfield'
import Button                          from '../../../components/common/Button'
import { ROLE_LABELS }                 from '../../../constants/roles'
import authService                from '../services/auth.service'
import { toast }                       from 'react-toastify'

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-1 bg-slate-800/50 rounded-xl px-4 py-3 flex-1">
    <span className="text-xl">{icon}</span>
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span className="text-sm font-semibold text-slate-200">{value}</span>
  </div>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 'lg' }) => {
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-base'
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover border-2 border-violet-500/40`}
      />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white
                     bg-gradient-to-br from-violet-500 to-cyan-400 border-2 border-violet-500/40`}>
      {initials}
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate()
  const { user, loading, handleUpdateProfile, handleLogout, loadProfile } = useAuth()

  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [form, setForm]             = useState({ name: '', email: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileRef = useRef(null)

  // Load profile on mount
  useEffect(() => { loadProfile() }, [])

  // Sync form when user data arrives
  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' })
    }
  }, [user])

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    fd.append('name', form.name)
    if (fileRef.current?.files?.[0]) fd.append('avatar', fileRef.current.files[0])
    await handleUpdateProfile(fd)
    setSaving(false)
    setEditing(false)
    setAvatarPreview(null)
  }

  const onCancel = () => {
    setEditing(false)
    setAvatarPreview(null)
    if (user) setForm({ name: user.name || '', email: user.email || '' })
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin-fast" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        background:
          'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%),' +
          '#0f172a',
      }}
    >
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header Card ─────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-fade-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

            {/* Avatar + upload */}
            <div className="relative group cursor-pointer" onClick={() => editing && fileRef.current?.click()}>
              <div className={editing ? 'opacity-80 transition-opacity' : ''}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="preview"
                         className="w-24 h-24 rounded-full object-cover border-2 border-violet-500/40" />
                  : <Avatar user={user} size="lg" />
                }
              </div>
              {editing && (
                <div className="absolute inset-0 flex items-center justify-center
                                rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold text-white">Change</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-slate-100">{user?.name || '—'}</h1>
              <p className="text-sm text-slate-500 mb-2">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                               bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {ROLE_LABELS[user?.role] || user?.role || 'User'}
              </span>
            </div>

            {/* Edit / Logout buttons */}
            <div className="flex gap-2">
              {!editing && (
                <Button
                  id="edit-profile-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Edit
                </Button>
              )}
              <Button
                id="logout-btn"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                🚪 Logout
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mt-5 pt-5 border-t border-slate-800">
            <StatCard icon="📅" label="Member since" value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                : '—'
            } />
            <StatCard icon="🛒" label="Orders" value={user?.orderCount ?? '0'} />
            <StatCard icon="⭐" label="Reviews" value={user?.reviewCount ?? '0'} />
          </div>
        </div>

        {/* ── Edit Form Card ─────────────────────────────────────────────── */}
        {editing && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-fade-up">
            <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
              Edit Profile
            </h2>

            <form onSubmit={onSave} id="edit-profile-form" className="flex flex-col gap-4">
              <InputField
                id="profile-name"
                name="name"
                label="Full name"
                placeholder="Your name"
                value={form.name}
                onChange={onChange}
                required
              />

              <InputField
                id="profile-email"
                name="email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={onChange}
                disabled
                className="opacity-60 cursor-not-allowed"
              />

              <div className="flex gap-3 pt-1">
                <Button
                  id="save-profile-btn"
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={saving}
                  className="flex-1"
                >
                  {!saving && '💾 Save Changes'}
                </Button>
                <Button
                  id="cancel-edit-btn"
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Info Card (read-only) ──────────────────────────────────────── */}
        {!editing && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-fade-up">
            <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-cyan-400 inline-block" />
              Account Details
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Full Name',  value: user?.name  },
                { label: 'Email',      value: user?.email },
                { label: 'Role',       value: ROLE_LABELS[user?.role] || user?.role },
                { label: 'Account ID', value: user?._id   },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4
                                            py-3 border-b border-slate-800 last:border-0">
                  <span className="text-xs font-medium text-slate-500 sm:w-32 shrink-0">{label}</span>
                  <span className="text-sm text-slate-200 font-medium break-all">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile
