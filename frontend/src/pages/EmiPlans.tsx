import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload, Trash2, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'
import StatsCard from '@/components/StatsCard'

interface EmiPlan {
  _id: string
  name: string
  accNo: string
  emiStartDate: string
  emiEndDate: string
  totalEmi: number
  totalPaidEmi: number
  totalAmt: number
  amtLeft: number
  monthlyEmi: number
  status: string
}

export default function EmiPlans() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: plans, isLoading } = useQuery({
    queryKey: ['emi-plans'],
    queryFn: async () => {
      const res = await api.get('/emi')
      return res.data.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['emi-stats'],
    queryFn: async () => {
      const res = await api.get('/emi/stats')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/emi', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emi-plans'] })
      queryClient.invalidateQueries({ queryKey: ['emi-stats'] })
      toast.success('EMI Plan created!')
      setShowModal(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/emi/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emi-plans'] })
      toast.success('EMI Plan deleted!')
    },
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/upload/emi', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${res.data.count} EMI plans imported!`)
      queryClient.invalidateQueries({ queryKey: ['emi-plans'] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">EMI Plans</h1>
          <p className="text-sm text-slate-500">Regular EMI schedules</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload EMI CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            <Plus className="w-4 h-4" />
            Create EMI Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Plans" value={stats?.total || 0} color="text-slate-900" icon={Calendar} />
        <StatsCard label="Active" value={stats?.active || 0} color="text-brand-600" icon={Calendar} />
        <StatsCard label="Customers Covered" value={stats?.covered || 0} color="text-emerald-600" icon={Calendar} />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : !plans || plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No EMI plans yet</p>
            <p className="text-sm text-slate-400">Upload EMI CSV or create a new plan</p>
          </div>
        ) : (
          plans.map((plan: EmiPlan) => (
            <div key={plan._id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{plan.name} — {plan.accNo}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    EMI: {formatDate(plan.emiStartDate)} → {formatDate(plan.emiEndDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    {plan.status}
                  </span>
                  <button onClick={() => deleteMutation.mutate(plan._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase">Total EMI</p>
                  <p className="text-lg font-semibold text-slate-900">{plan.totalEmi}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase">Paid EMI</p>
                  <p className="text-lg font-semibold text-emerald-600">{plan.totalPaidEmi}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase">Remaining</p>
                  <p className="text-lg font-semibold text-brand-600">{plan.totalEmi - plan.totalPaidEmi}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase">Amount Left</p>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(plan.amtLeft)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create EMI Plan">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = Object.fromEntries(new FormData(form))
          createMutation.mutate({
            ...data,
            totalEmi: Number(data.totalEmi),
            totalPaidEmi: Number(data.totalPaidEmi) || 0,
            totalAmt: Number(data.totalAmt),
            amtLeft: Number(data.amtLeft),
            monthlyEmi: Number(data.monthlyEmi) || 0,
          })
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input name="name" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Account No.</label>
              <input name="accNo" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">EMI Start Date</label>
              <input name="emiStartDate" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">EMI End Date</label>
              <input name="emiEndDate" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Total EMI (months)</label>
              <input name="totalEmi" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Total Paid EMI</label>
              <input name="totalPaidEmi" type="number" defaultValue="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (₹)</label>
              <input name="totalAmt" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Amount Left (₹)</label>
              <input name="amtLeft" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Create Plan</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
