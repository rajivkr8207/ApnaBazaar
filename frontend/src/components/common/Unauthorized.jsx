import { Link } from 'react-router'

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-3xl flex items-center justify-center mx-auto text-amber-400">
          🚫
        </div>
        <h1 className="text-2xl font-bold text-slate-100">403 – Unauthorized</h1>
        <p className="text-sm text-slate-400">
          You do not have permission or the required role to access this page.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors shadow-lg shadow-violet-600/20"
          >
            <span>🏠</span> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
