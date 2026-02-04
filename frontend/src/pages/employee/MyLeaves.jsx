import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Clock, FileText, Filter } from 'lucide-react'
import axios from 'axios'

import CreateLeaveModal from '../../components/CreateLeaveModal'

const LeaveCard = ({ leave }) => {
    const statusColor = {
        PENDING: 'var(--color-primary)',
        APPROVED: '#00ff80',
        REJECTED: '#ff0055',
        CANCELLED: '#888'
    }[leave.status] || 'var(--color-primary)'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
                padding: '20px',
                borderLeft: `4px solid ${statusColor}`,
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
            }}
        >
            <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{
                        background: leave.leave_type?.color_hex || '#333',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                    }}>
                        {leave.leave_type?.name || 'Leave'}
                    </span>
                    <span style={{
                        color: statusColor,
                        fontSize: '0.85rem', fontWeight: 600,
                        backgroundColor: `rgba(${statusColor === '#00ff80' ? '0,255,128' : statusColor === '#ff0055' ? '255,0,85' : '0,240,255'}, 0.1)`,
                        padding: '2px 8px', borderRadius: '12px'
                    }}>
                        {leave.status}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 500, marginBottom: '4px' }}>
                    <Calendar size={18} color="var(--color-secondary)" />
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Duration: {leave.total_days} Day{leave.total_days !== 1 && 's'}
                </div>

                {leave.reason && (
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                        <FileText size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        "{leave.reason}"
                    </div>
                )}
            </div>

            {leave.manager_comment && (
                <div style={{
                    flex: 1, minWidth: '200px',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '12px', borderRadius: '8px',
                    fontSize: '0.9rem'
                }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-main)' }}>Manager's Note:</strong>
                    <span style={{ color: 'var(--text-muted)' }}>"{leave.manager_comment}"</span>
                </div>
            )}
        </motion.div>
    )
}

const MyLeaves = () => {
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [filter, setFilter] = useState('ALL')

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
            console.error("Error fetching leaves:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLeaves = leaves.filter(l => {
        if (filter === 'ALL') return true
        return l.status === filter
    })

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Leaves</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track and manage your time off</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="glass-button"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Plus size={20} /> Apply Leave
                </motion.button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            background: filter === status ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                            border: filter === status ? '1px solid var(--color-primary)' : '1px solid transparent',
                            color: filter === status ? 'var(--color-primary)' : 'var(--text-muted)',
                            padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                            fontSize: '0.9rem', transition: 'all 0.3s ease'
                        }}
                    >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading records...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence>
                        {filteredLeaves.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
                                <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                                <p>No leave records found.</p>
                            </div>
                        ) : (
                            filteredLeaves.map(leave => (
                                <LeaveCard key={leave.id} leave={leave} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}

            <CreateLeaveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onRequestCreated={fetchLeaves}
            />
        </div>
    )
}

export default MyLeaves
