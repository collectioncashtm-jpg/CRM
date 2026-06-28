import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard')
      return res.data.data
    },
  })
}
