import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, AlertTriangle, Cash, CalendarStats } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

type ReportType = 'portfolio' | 'overdue' | 'collection' | 'emi'

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null)

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report', activeReport],
    queryFn: async () => {
      if (!activeReport) return null
      const res = await api.get(`/reports/${activeReport}`)
      return res.data.data
    },
    enabled: !!activeReport,
  })

  const reportCards = [
    { id: 'portfolio' as ReportType, title: 'Portfolio Summary', desc: 'Total customers, loans, outstanding amounts', icon: BarChart3, color: 'text-brand-600' },
    { id: 'overdue' as ReportType, title: 'Overdue Report', desc: 'All overdue accounts and amounts', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'collection' as ReportType, title: 'Collection Report', desc: 'Payments received this month', icon: Cash, color: 'text-emerald-600' },
    { id: 'emi' as ReportType, title: 'EMI Due Report', desc: 'Upcoming EMI schedules', icon: CalendarStats, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Generate and view reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveReport(card.id)}
            className={`bg-white rounded-xl border p-5 text-left hover:border-brand-300 transition-colors ${
              activeReport === card.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-slate-50 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{card.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{card.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {activeReport && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 capitalize">{activeReport} Report</h3>

          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading report...</div>
          ) : !reportData ? (
            <div className="text-center py-8 text-slate-400">No data available</div>
          ) : (
            <div className="space-y-4">
              {activeReport === 'portfolio' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 uppercase">Total Customers</p>
                    <p className="text-xl font-bold text-slate-900">{reportData.totalCustomers || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 uppercase">Total Loans</p>
                    <p className="text-xl font-bold text-slate-900">{reportData.totalLoans || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 uppercase">Total Disbursed</p>
                    <p className="text-xl font-bold text-brand-600">{formatCurrency(reportData.totalDisbursed || 0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 uppercase">EMI Plans</p>
                    <p className="text-xl font-bold text-slate-900">{reportData.totalEmiPlans || 0}</p>
                  </div>
                </div>
              )}

              {activeReport === 'overdue' && (
                <div>
                  <p className="text-sm text-slate-600 mb-4">
                    Total Overdue: <span className="font-bold text-red-600">{formatCurrency(reportData.totalOverdue || 0)}</span> 
                    ({reportData.count || 0} accounts)
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {reportData.accounts?.map((acc: any) => (
                      <div key={acc._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900">{acc.name}</span>
                        <span className="font-bold text-red-600">{formatCurrency(acc.overdue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeReport === 'collection' && (
                <div>
                  <p className="text-sm text-slate-600 mb-4">Monthly collection breakdown</p>
                  <div className="space-y-2">
                    {reportData.monthlyPayments?.map((item: any) => (
                      <div key={item._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900">{item._id}</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(item.total)} ({item.count} transactions)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeReport === 'emi' && (
                <div>
                  <p className="text-sm text-slate-600 mb-4">
                    {reportData.length || 0} active EMI plans with upcoming dues
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {reportData?.map((emi: any) => (
                      <div key={emi._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <span className="font-medium text-slate-900">{emi.name}</span>
                          <span className="text-sm text-slate-500 ml-2">({emi.accNo})</span>
                        </div>
                        <span className="text-sm text-slate-500">Due: {emi.emiEndDate?.split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
