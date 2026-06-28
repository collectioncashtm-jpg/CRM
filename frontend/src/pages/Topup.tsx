import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'

interface Topup {
  _id: string
  accNo: string
  topupAmount: number
  emiStartDate: string
  emiEndDate: string
  monthlyEmi: number
  status: string
}

export default function TopupPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: topups, isLoading } = useQuery({
    queryKey: ['topups'],
    queryFn: async () => {
      const res = await api.get('/topup')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/topup', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topups'] })
      toast.success('Top-up created!')
      setShowModal(false)
    },
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/upload/topup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${res.data.count} top-ups imported!`)
      queryClient.invalidateQueries({ queryKey: ['topups'] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Top-up</h1>
          <p className="text-sm text-slate-500">Top-up loan records</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Top-up CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            <Plus className="w-4 h-4" />
            Create Top-up
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm text-slate-600">
          A top-up loan adds extra credit on an existing active loan. Upload Top-up CSV or create manually.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Account No.</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Top-up Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">EMI Start</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">EMI End</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Monthly EMI</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : !topups || topups.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No top-up records</td></tr>
              ) : (
                topups.map((t: Topup) => (
                  <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-brand-600">{t.accNo}</td>
                    <td className="py-3 px-4 font-medium text-brand-600">{formatCurrency(t.topupAmount)}</td>
                    <td className="py-3 px-4">{formatDate(t.emiStartDate)}</td>
                    <td className="py-3 px-4">{formatDate(t.emiEndDate)}</td>
                    <td className="py-3 px-4">{formatCurrency(t.monthlyEmi)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Top-up">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = Object.fromEntries(new FormData(form))
          createMutation.mutate({
            ...data,
            topupAmount: Number(data.topupAmount),
            monthlyEmi: Number(data.monthlyEmi) || 0,
          })
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Account No.</label>
              <input name="accNo" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Top-up Amount (₹)</label>
              <input name="topupAmount" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">EMI Start Date</label>
              <input name="emiStartDate" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">EMI End Date</label>
              <input name="emiEndDate" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Monthly EMI (₹)</label>
              <input name="monthlyEmi" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Create Top-up</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
