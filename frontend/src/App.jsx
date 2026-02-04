import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Employees from './pages/admin/Employees'
import Leaves from './pages/admin/Leaves'
import Calendar from './pages/admin/Calendar'
import OT from './pages/admin/OT'
import ManagerLayout from './components/ManagerLayout'
import ManagerDashboard from './pages/manager/Dashboard'
import ManagerTeam from './pages/manager/Team'
import ManagerLeaveApprovals from './pages/manager/LeaveApprovals'
import ManagerOTApprovals from './pages/manager/OTApprovals'
import EmployeeLayout from './components/EmployeeLayout'
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeMyLeaves from './pages/employee/MyLeaves'
import EmployeeMyOvertime from './pages/employee/MyOvertime'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="leaves" element={<Leaves />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="overtime" element={<OT />} />
                    <Route path="settings" element={<div style={{ padding: '2rem' }}>System Settings (Coming Soon)</div>} />
                </Route>

                {/* Manager Routes */}
                <Route path="/manager" element={<ManagerLayout />}>
                    <Route index element={<Navigate to="/manager/dashboard" replace />} />
                    <Route path="dashboard" element={<ManagerDashboard />} />
                    <Route path="team" element={<ManagerTeam />} />
                    <Route path="leaves" element={<ManagerLeaveApprovals />} />
                    <Route path="overtime" element={<ManagerOTApprovals />} />
                </Route>

                {/* Employee Routes */}
                <Route path="/employee" element={<EmployeeLayout />}>
                    <Route index element={<Navigate to="/employee/dashboard" replace />} />
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="leaves" element={<EmployeeMyLeaves />} />
                    <Route path="overtime" element={<EmployeeMyOvertime />} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
