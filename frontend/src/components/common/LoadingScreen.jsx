import React from 'react'

const LoadingScreen = ({ message = 'Verifying session...' }) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-950"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.18) 0%, transparent 70%),' +
          'radial-gradient(ellipse 60% 40% at 100% 90%, rgba(6,182,212,0.1) 0%, transparent 60%),' +
          '#0f172a',
      }}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        {/* Animated Brand Logo */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
                        bg-gradient-to-br from-violet-500 to-cyan-400 shadow-xl shadow-violet-500/40 animate-pulse">
          🛍️
        </div>

        {/* Loading Spinner & Label */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800">
          <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
          <span className="text-slate-300 font-medium text-xs tracking-wide">
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
