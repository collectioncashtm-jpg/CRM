import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'

interface Moratorium {
  _id: string
  accNo: string
  moratoriumStart: string
  moratoriumEnd: string
  interestAccrual: string
  newEmiEndDate: string
  status: string
}

export default function MoratoriumPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: moratoria, isLoading } = useQuery({
    queryKey: ['moratoria'],
    queryFn: async () => {
      const res = await api.get('/moratorium')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/moratorium', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moratoria'] })
      toast.success('Moratorium created!')
      setShowModal(false)
    },
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/upload/moratorium', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${res.data.count} moratorium records imported!`)
      queryClient.invalidateQueries({ queryKey: ['moratoria'] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moratorium</h1>
          <p className="text-sm text-slate-500">EMI pause records</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Moratorium CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            <Plus className="w-4 h-4" />
            Create Moratorium
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm text-slate-600">
          Moratorium is a temporary pause on EMI payments. Interest may or may not accrue during this period.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Account No.</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Mora. Start</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Mora. End</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Interest</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">New EMI End</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : !moratoria || moratoria.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No moratorium records</td></tr>
              ) : (
                moratoria.map((m: Moratorium) => (
                  <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-brand-600">{m.accNo}</td>
                    <td className="py-3 px-4">{formatDate(m.moratoriumStart)}</td>
                    <td className="py-3 px-4">{formatDate(m.moratoriumEnd)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        m.interestAccrual === 'yes' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {m.interestAccrual === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(m.newEmiEndDate)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Moratorium">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = Object.fromEntries(new FormData(form))
          createMutation.mutate(data)
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Account No.</label>
              <input name="accNo" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Interest Accrual</label>
              <select name="interestAccrual" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Moratorium Start</label>
              <input name="moratoriumStart" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Moratorium End</label>
              <input name="moratoriumEnd" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">New EMI End Date</label>
              <input name="newEmiEndDate" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Create Moratorium</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
