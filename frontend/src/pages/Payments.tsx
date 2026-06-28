import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'

interface Payment {
  _id: string
  name: string
  accNo: string
  amount: number
  type: string
  date: string
  mode: string
  recordedBy: string
}

export default function Payments() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await api.get('/payments')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payment recorded!')
      setShowModal(false)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">All payment records</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Account No.</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Mode</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : !payments || payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No payments recorded yet</td></tr>
              ) : (
                payments.map((p: Payment) => (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-brand-600">{p.accNo}</td>
                    <td className="py-3 px-4 font-medium text-emerald-600">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4">{formatDate(p.date)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize">{p.mode}</td>
                    <td className="py-3 px-4 text-slate-500">{p.recordedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = Object.fromEntries(new FormData(form))
          createMutation.mutate({
            ...data,
            amount: Number(data.amount),
            date: data.date || new Date().toISOString().split('T')[0],
          })
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input name="name" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Account No.</label>
              <input name="accNo" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input name="amount" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Payment Type</label>
              <select name="type" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option>EMI Payment</option>
                <option>Part Payment</option>
                <option>Overdue Payment</option>
                <option>Pre-closure</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
              <select name="mode" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="auto_debit">Auto Debit</option>
              </select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
