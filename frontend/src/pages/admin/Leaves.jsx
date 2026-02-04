import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Check, X, Filter, Plus } from 'lucide-react'

import CreateLeaveModal from '../../components/CreateLeaveModal'

const LeaveRow = ({ leave, onAction }) => {
    // Helper to format date
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString()
    }

    const statusColors = {
        PENDING: 'rgba(255, 165, 0, 0.2)',
        APPROVED: 'rgba(0, 255, 0, 0.2)',
        REJECTED: 'rgba(255, 0, 85, 0.2)',
        CANCELLED: 'rgba(128, 128, 128, 0.2)'
    }

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
            <td style={{ padding: '16px', fontWeight: 500 }}>
                {leave.user ? (
                    <div>
                        <div>{leave.user.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leave.user.email}</div>
                    </div>
                ) : (
                    <span>User #{leave.user_id}</span>
                )}
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{ fontWeight: 500 }}>{formatDate(leave.start_date)} - {formatDate(leave.end_date)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leave.total_days} days</div>
            </td>
            <td style={{ padding: '16px' }}>Leave Type {leave.leave_type_id}</td>
            <td style={{ padding: '16px', color: 'var(--text-muted)', maxWidth: '200px' }}>{leave.reason}</td>
            <td style={{ padding: '16px' }}>
                <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    background: statusColors[leave.status] || 'rgba(255,255,255,0.1)',
                    color: 'white'
                }}>
                    {leave.status}
                </span>
            </td>
            <td style={{ padding: '16px' }}>
                {leave.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => onAction(leave.id, 'APPROVED')}
                            className="glass-button"
                            style={{ padding: '8px', minWidth: 'auto', borderColor: 'green', color: 'lightgreen' }}
                        >
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => onAction(leave.id, 'REJECTED')}
                            className="glass-button"
                            style={{ padding: '8px', minWidth: 'auto', borderColor: 'red', color: 'var(--color-accent)' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </td>
        </motion.tr>
    )
}

const Leaves = () => {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        fetchLeaves()
    }, [])

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/v1/leaves/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLeaves(response.data)
        } catch (error) {
            console.error("Failed to fetch leaves", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`/api/v1/leaves/${id}`,
                { status: status },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchLeaves() // Refresh list
        } catch (error) {
            console.error("Failed to update leave", error)
            alert("Failed to update status")
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Global Leave Operations</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="glass-button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> New Request
                    </button>
                    <button className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} /> Filter
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Employee</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Date & Duration</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Type</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Reason</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : leaves.length > 0 ? (
                            leaves.map(leave => (
                                <LeaveRow key={leave.id} leave={leave} onAction={handleAction} />
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No leave requests found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateLeaveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onRequestCreated={fetchLeaves}
            />
        </div>
    )
}

export default Leaves
