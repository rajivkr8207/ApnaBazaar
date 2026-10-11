import { Outlet } from 'react-router'
import Sidebar from './Sidebar'

const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className="flex-1 h-screen overflow-y-auto px-4 py-8 sm:px-8"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 60%), #0f172a',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
