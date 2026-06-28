import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'

interface Loan {
  _id: string
  customerId?: { name: string; phoneNo: string }
  accNo: string
  disbursedDate: string
  disbursedAmt: number
  overdue: number
  status: string
  loanType: string
}

export default function Loans() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['loans', page, search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/loans', {
        params: { page, limit: 10, search, status: statusFilter }
      })
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/loans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      toast.success('Loan created!')
      setShowModal(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/loans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      toast.success('Loan deleted!')
    },
  })

  const loans: Loan[] = data?.data || []
  const totalPages = data?.totalPages || 1

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      case 'closed': return 'bg-slate-100 text-slate-700'
      case 'npa': return 'bg-amber-100 text-amber-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
          <p className="text-sm text-slate-500">All loan records</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          <Plus className="w-4 h-4" />
          New Loan
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, account no..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Account No.</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Disbursed</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Overdue</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No loans found</td></tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{loan.customerId?.name || '-'}</td>
                    <td className="py-3 px-4 font-mono text-brand-600">{loan.accNo}</td>
                    <td className="py-3 px-4 capitalize">{loan.loanType}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(loan.disbursedDate)}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(loan.disbursedAmt)}</td>
                    <td className="py-3 px-4 text-red-600">{loan.overdue > 0 ? formatCurrency(loan.overdue) : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">View</button>
                        <button 
                          onClick={() => deleteMutation.mutate(loan._id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Loan">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = Object.fromEntries(new FormData(form))
          createMutation.mutate({
            ...data,
            disbursedAmt: Number(data.disbursedAmt),
            overdue: Number(data.overdue) || 0,
          })
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input name="name" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account No.</label>
              <input name="accNo" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Disbursed Date</label>
              <input name="disbursedDate" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input name="disbursedAmt" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loan Type</label>
              <select name="loanType" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="home">Home</option>
                <option value="vehicle">Vehicle</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Add Loan</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
