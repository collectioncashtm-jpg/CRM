import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Loans from './pages/Loans'
import EmiPlans from './pages/EmiPlans'
import Topup from './pages/Topup'
import Moratorium from './pages/Moratorium'
import Payments from './pages/Payments'
import Collections from './pages/Collections'
import Tasks from './pages/Tasks'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="loans" element={<Loans />} />
          <Route path="emi" element={<EmiPlans />} />
          <Route path="topup" element={<Topup />} />
          <Route path="moratorium" element={<Moratorium />} />
          <Route path="payments" element={<Payments />} />
          <Route path="collections" element={<Collections />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App
