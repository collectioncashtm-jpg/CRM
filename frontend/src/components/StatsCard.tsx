import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  color?: string
  icon?: LucideIcon
}

export default function StatsCard({ label, value, color = 'text-slate-900', icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center justify-between mt-2">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {Icon && <Icon className="w-5 h-5 text-slate-300" />}
      </div>
    </div>
  )
}
