import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react'
import axios from 'axios'

const OTApprovalCard = ({ request, onAction }) => {
    // Determine status color
    const statusColor = {
        PENDING: 'var(--color-primary)',
        APPROVED: '#00ff80',
        REJECTED: '#ff0055',
    }[request.status] || 'var(--color-primary)'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel"
            style={{
                padding: '20px',
                borderLeft: `4px solid ${statusColor}`,
                marginBottom: '16px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                {/* User Info */}
                <div style={{ display: 'flex', gap: '16px', minWidth: '200px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <User size={24} color={statusColor} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{request.user?.full_name || 'Unknown User'}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{request.user?.designation}</span>
                    </div>
                </div>

                {/* OT Details */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            Overtime
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            • Total Hours: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{request.total_hours} hrs</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={16} color="var(--color-secondary)" />
                            {new Date(request.ot_date).toLocaleDateString()} • {request.start_time} - {request.end_time}
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
                {request.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAction(request.id, 'APPROVED')}
                            className="glass-button"
                            style={{
                                backgroundColor: 'rgba(0, 255, 128, 0.1)',
                                borderColor: 'rgba(0, 255, 128, 0.3)',
                                color: '#00ff80',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <CheckCircle size={18} /> Approve
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAction(request.id, 'REJECTED')}
                            className="glass-button"
                            style={{
                                backgroundColor: 'rgba(255, 0, 85, 0.1)',
                                borderColor: 'rgba(255, 0, 85, 0.3)',
                                color: '#ff0055',
                                display: 'flex', alignItems: 'center', gap: '8px'
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

const OTApprovals = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('PENDING')

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/v1/ot/approvals', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRequests(response.data)
        } catch (error) {
            console.error("Error fetching OT approvals:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`/api/v1/ot/${id}`, {
                status: status,
                manager_comment: status === 'APPROVED' ? 'Approved by Manager' : 'Rejected by Manager'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setRequests(prev => prev.filter(r => r.id !== id))
            alert(`OT request ${status.toLowerCase()} successfully.`)
        } catch (error) {
            console.error("Error processing request:", error)
            alert("Failed to process request: " + (error.response?.data?.detail || error.message))
        }
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>OT Approvals</h1>
                <p style={{ color: 'var(--text-muted)' }}>Review and approve overtime hours</p>
            </div>

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
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <AnimatePresence>
                        {requests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
                                <CheckCircle size={48} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                                <h3>All Caught Up!</h3>
                                <p>No pending overtime requests.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <OTApprovalCard key={req.id} request={req} onAction={handleAction} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

export default OTApprovals
