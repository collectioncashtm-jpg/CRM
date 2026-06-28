import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CheckSquare, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Modal from '@/components/Modal'

interface Task {
  _id: string
  title: string
  dueDate: string
  priority: string
  status: string
  done: boolean
}

export default function Tasks() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task added!')
      setShowModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted!')
    },
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-amber-100 text-amber-700'
      case 'Low': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500">Manage your tasks</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No tasks yet</p>
            <p className="text-sm text-slate-400">Add a task to get started</p>
          </div>
        ) : (
          tasks.map((task: Task) => (
            <div key={task._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => updateMutation.mutate({ id: task._id, data: { done: !task.done } })}
                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div className="flex-1">
                <p className={`font-medium ${task.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-slate-500 mt-0.5">Due: {formatDate(task.dueDate)}</p>
                )}
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <button onClick={() => deleteMutation.mutate(task._id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Task">
        <form onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement
          const data = Object.fromEntries(new FormData(form))
          createMutation.mutate(data)
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
            <input name="title" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input name="dueDate" type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select name="priority" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Add Task</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
