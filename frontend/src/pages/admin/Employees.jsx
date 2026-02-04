import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Search, Plus, User, Trash2, Edit } from 'lucide-react'
import AddEmployeeModal from '../../components/AddEmployeeModal'
import EditEmployeeModal from '../../components/EditEmployeeModal'

const EmployeeRow = ({ employee, onEdit, onDelete }) => {
    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ backgroundColor: 'rgba(3, 24, 90, 0.02)' }}
            style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
            <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <User size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{employee.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{employee.email}</div>
                    </div>
                </div>
            </td>
            <td style={{ padding: '16px' }}>
                <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500,
                    background: employee.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                    color: employee.role === 'ADMIN' ? 'var(--color-error)' : 'var(--color-secondary)',
                    border: '1px solid transparent'
                }}>
                    {employee.role}
                </span>
            </td>
            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                {employee.designation || '-'}
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onEdit(employee)}
                        className="glass-button"
                        style={{ padding: '8px', minWidth: 'auto', background: 'white', border: '1px solid var(--border-glass)', color: 'var(--color-primary)', boxShadow: 'none' }}
                    >
                        <Edit size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user?')) {
                                onDelete(employee.id)
                            }
                        }}
                        className="glass-button"
                        style={{ padding: '8px', minWidth: 'auto', color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.3)', background: 'white', boxShadow: 'none' }}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </td>
        </motion.tr>
    )
}

// ... imports ...

const Employees = () => {
    // ... logic ...
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/v1/users/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setEmployees(response.data)
        } catch (error) {
            console.error("Failed to fetch employees", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (employee) => {
        setSelectedEmployee(employee)
        setIsEditModalOpen(true)
    }

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`/api/v1/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchEmployees() // Refresh
        } catch (error) {
            console.error("Failed to delete user", error)
            alert(error.response?.data?.detail || "Failed to delete user")
        }
    }

    const filteredEmployees = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase())
    )

    const managers = employees.filter(e => e.role === 'ADMIN' || e.role === 'MANAGER')

    return (
        <div>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={22} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Search employees..."
                        style={{ paddingLeft: '40px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="glass-button"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={22} />
                    Add Employee
                </button>
            </div>

            {/* Data Table */}
            <div className="glass-panel" style={{ overflow: 'hidden', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-glass)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', background: '#f8fafc' }}>
                            <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map(emp => (
                                <EmployeeRow key={emp.id} employee={emp} onEdit={handleEdit} onDelete={handleDelete} />
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No employees found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={fetchEmployees}
            />

            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setSelectedEmployee(null)
                }}
                employee={selectedEmployee}
                availableManagers={managers}
                onUserUpdated={fetchEmployees}
            />
        </div>
    )
}

export default Employees
