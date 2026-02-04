import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Check, X, Filter, Plus, Clock } from 'lucide-react'

import CreateOTModal from '../../components/CreateOTModal'

const OTRow = ({ ot, onAction }) => {
    // Helper to format date
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString()
    }

    // Helper to format time (HH:MM:SS -> HH:MM)
    const formatTime = (timeStr) => {
        if (!timeStr) return ''
        return timeStr.substring(0, 5)
    }

    const statusColors = {
        PENDING: 'rgba(255, 165, 0, 0.2)',
        APPROVED: 'rgba(0, 255, 0, 0.2)',
        REJECTED: 'rgba(255, 0, 85, 0.2)'
    }

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ borderBottom: '1px solid var(--border-glass)' }}
        >
            <td style={{ padding: '16px', fontWeight: 500 }}>
                {ot.user ? (
                    <div>
                        <div>{ot.user.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ot.user.email}</div>
                    </div>
                ) : (
                    <span>User #{ot.user_id}</span>
                )}
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{ fontWeight: 500 }}>{formatDate(ot.ot_date)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {formatTime(ot.start_time)} - {formatTime(ot.end_time)}
                </div>
            </td>
            <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--color-primary)" />
                    {ot.total_hours} hrs
                </div>
            </td>
            <td style={{ padding: '16px', color: 'var(--text-muted)', maxWidth: '200px' }}>{ot.reason}</td>
            <td style={{ padding: '16px' }}>
                <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    background: statusColors[ot.status] || 'rgba(255,255,255,0.1)',
                    color: 'white'
                }}>
                    {ot.status}
                </span>
            </td>
            <td style={{ padding: '16px' }}>
                {ot.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => onAction(ot.id, 'APPROVED')}
                            className="glass-button"
                            style={{ padding: '8px', minWidth: 'auto', borderColor: 'green', color: 'lightgreen' }}
                        >
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => onAction(ot.id, 'REJECTED')}
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

const OT = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/v1/ot/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRequests(response.data)
        } catch (error) {
            console.error("Failed to fetch OT", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`/api/v1/ot/${id}`,
                { status: status },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchRequests() // Refresh list
        } catch (error) {
            console.error("Failed to update OT", error)
            alert("Failed to update status")
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Overtime Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="glass-button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> New Claim
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
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Date & Time</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Duration</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Reason</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : requests.length > 0 ? (
                            requests.map(req => (
                                <OTRow key={req.id} ot={req} onAction={handleAction} />
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No overtime claims found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateOTModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onRequestCreated={fetchRequests}
            />
        </div>
    )
}

export default OT
