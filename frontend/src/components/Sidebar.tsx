import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, Building2, Calendar,
  TrendingUp, Pause, Receipt, BarChart3, CheckSquare, Settings,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/loans', label: 'Loans', icon: CreditCard },
  { path: '/collections', label: 'Collections', icon: Building2 },
  { path: '/emi', label: 'EMI Plans', icon: Calendar },
  { path: '/topup', label: 'Top-up', icon: TrendingUp },
  { path: '/moratorium', label: 'Moratorium', icon: Pause },
  { path: '/payments', label: 'Payments', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-lg">
            NF
          </div>
          <div>
            <h1 className="font-semibold text-sm">Narainsons</h1>
            <p className="text-xs text-slate-400">Finance & Consultancy</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border-l-2 border-brand-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-brand-900/30 rounded-lg p-3 border border-brand-800/30">
          <p className="text-xs text-brand-300 font-medium mb-1">Support Team</p>
          <p className="text-xs text-slate-500">9211220702 / 03 / 04</p>
          <p className="text-xs text-slate-500">collection.cashtm@gmail.com</p>
        </div>
      </div>
    </aside>
  )
}
