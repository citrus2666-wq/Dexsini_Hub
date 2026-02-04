import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react'
import axios from 'axios'


const LeaveApprovalCard = ({ request, onAction }) => {
    // Determine status color
    const statusColor = {
        PENDING: 'var(--color-primary)',
        PENDING_ADMIN: 'var(--color-accent)', // Amber for escalation
        APPROVED: 'var(--color-success)',
        REJECTED: 'var(--color-error)',
        CANCELLED: 'var(--text-muted)'
    }[request.status] || 'var(--color-primary)'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel"
            style={{
                padding: '24px',
                borderLeft: `4px solid ${statusColor}`,
                marginBottom: '16px',
                background: 'white',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                {/* User Info */}
                <div style={{ display: 'flex', gap: '16px', minWidth: '200px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <User size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{request.user?.full_name || 'Unknown User'}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{request.user?.designation}</span>
                    </div>
                </div>

                {/* Leave Details */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                            background: request.leave_type?.color_hex || '#e2e8f0',
                            color: '#1e293b',
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            {request.leave_type?.name}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            • {request.total_days} Days
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} color="var(--color-secondary)" />
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </div>
                    </div>
                    {request.reason && (
                        <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                            <FileText size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            "{request.reason}"
                        </div>
                    )}
                </div>

                {/* Actions */}
                {(request.status === 'PENDING' || request.status === 'PENDING_ADMIN') && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onAction(request.id, 'APPROVED')}
                            className="glass-button"
                            style={{
                                backgroundColor: 'white',
                                borderColor: 'var(--color-success)',
                                color: 'var(--color-success)',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px',
                                boxShadow: 'none'
                            }}
                        >
                            <CheckCircle size={18} /> Approve
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onAction(request.id, 'REJECTED')}
                            className="glass-button"
                            style={{
                                backgroundColor: 'white',
                                borderColor: 'var(--color-error)',
                                color: 'var(--color-error)',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px',
                                boxShadow: 'none'
                            }}
                        >
                            <XCircle size={18} /> Reject
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

const LeaveApprovals = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('PENDING') // PENDING, HISTORY

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token')
            // Fetch Pending Approvals
            const response = await axios.get('/api/v1/leaves/approvals', {
                headers: { Authorization: `Bearer ${token}` }
            })
            // For now, API only returns PENDING. 
            // In future, API could support filter=HISTORY or we fetch all and filter client side.
            // But let's assume /approvals is specifically for pending queue.
            setRequests(response.data)
        } catch (error) {
            console.error("Error fetching approvals:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`/api/v1/leaves/${id}`, {
                status: status,
                manager_comment: status === 'APPROVED' ? 'Approved by Manager' : 'Rejected by Manager'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Remove from list or refresh
            setRequests(prev => prev.filter(r => r.id !== id))
            alert(`Leave request ${status.toLowerCase()} successfully.`)
        } catch (error) {
            console.error("Error processing request:", error)
            alert("Failed to process request: " + (error.response?.data?.detail || error.message))
        }
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Leave Approvals</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your team's time-off requests</p>
            </div>

            {/* Filter Tabs (Visual Only for now as we fetch pending) */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
                <button
                    onClick={() => setFilter('PENDING')}
                    style={{
                        background: 'transparent', border: 'none',
                        color: filter === 'PENDING' ? 'var(--color-primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'PENDING' ? 600 : 400,
                        cursor: 'pointer', fontSize: '1rem'
                    }}
                >
                    Pending Queue ({requests.length})
                </button>
                <button
                    onClick={() => setFilter('HISTORY')}
                    disabled
                    style={{
                        background: 'transparent', border: 'none',
                        color: 'var(--text-muted)', opacity: 0.5,
                        cursor: 'not-allowed', fontSize: '1rem'
                    }}
                >
                    History (Coming Soon)
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading requests...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <AnimatePresence>
                        {requests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
                                <CheckCircle size={48} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                                <h3>All Caught Up!</h3>
                                <p>No pending leave requests at the moment.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <LeaveApprovalCard key={req.id} request={req} onAction={handleAction} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

export default LeaveApprovals
