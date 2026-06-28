import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Users, CreditCard, IndianRupee, AlertCircle, Clock,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#7c3aed', '#16a34a', '#f59e0b', '#ef4444']

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  const kpis = dashboardData?.kpis || {}

  const kpiCards = [
    {
      title: 'Total Customers',
      value: kpis.totalCustomers || 0,
      sub: `${kpis.activeLoans || 0} active, ${kpis.overdueLoans || 0} overdue`,
      icon: Users,
      color: 'bg-brand-100 text-brand-700',
      trend: 'up',
    },
    {
      title: 'Active Loans',
      value: kpis.activeLoans || 0,
      sub: 'Currently active',
      icon: CreditCard,
      color: 'bg-emerald-100 text-emerald-700',
      trend: 'up',
    },
    {
      title: 'Total Outstanding',
      value: formatCurrency(kpis.totalDisbursed || 0),
      sub: 'Total disbursed',
      icon: IndianRupee,
      color: 'bg-amber-100 text-amber-700',
      trend: 'up',
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(kpis.totalOutstanding || 0),
      sub: 'Needs collection',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-700',
      trend: 'down',
    },
    {
      title: 'EMI Due Today',
      value: kpis.activeEmi || 0,
      sub: 'Active EMI plans',
      icon: Clock,
      color: 'bg-blue-100 text-blue-700',
      trend: 'neutral',
    },
  ]

  const collectionData = dashboardData?.collectionTrend || []

  const pieData = [
    { name: '0-30 Days', value: 36 },
    { name: '31-60 Days', value: 25 },
    { name: '61-90 Days', value: 19 },
    { name: '90+ Days', value: 20 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, Admin</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <div className="flex items-center gap-1 text-xs">
              {kpi.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              {kpi.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className={kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-500'}>
                {kpi.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Collection Trend</h3>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={collectionData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#7c3aed" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Outstanding by Bucket</h3>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx={100}
                  cy={100}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-slate-600">{entry.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Activities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Details</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentActivities?.map((activity: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      activity.type.includes('payment') ? 'bg-emerald-100 text-emerald-700' :
                      activity.type.includes('overdue') ? 'bg-red-100 text-red-700' :
                      'bg-brand-100 text-brand-700'
                    }`}>
                      {activity.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{activity.customerName || '-'}</td>
                  <td className="py-3 px-4 text-slate-600">{activity.description}</td>
                  <td className="py-3 px-4 font-medium">
                    {activity.amount ? formatCurrency(activity.amount) : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {formatDate(activity.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
