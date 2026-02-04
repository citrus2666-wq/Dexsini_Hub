import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plus, CheckCircle, XCircle, FileText } from 'lucide-react'
import axios from 'axios'
import CreateOTModal from '../../components/CreateOTModal'

const OTCard = ({ request }) => {
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
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        Overtime
                    </span>
                    <span style={{
                        color: statusColor,
                        fontSize: '0.85rem', fontWeight: 600,
                        backgroundColor: `rgba(${statusColor === '#00ff80' ? '0,255,128' : statusColor === '#ff0055' ? '255,0,85' : '0,240,255'}, 0.1)`,
                        padding: '2px 8px', borderRadius: '12px'
                    }}>
                        {request.status}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 500, marginBottom: '4px' }}>
                    <Clock size={18} color="var(--color-secondary)" />
                    {new Date(request.ot_date).toLocaleDateString()} • {request.start_time} - {request.end_time}
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Total Hours: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{request.total_hours} hrs</span>
                </div>

                {request.reason && (
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                        <FileText size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        "{request.reason}"
                    </div>
                )}
            </div>

            {request.manager_comment && (
                <div style={{
                    flex: 1, minWidth: '200px',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '12px', borderRadius: '8px',
                    fontSize: '0.9rem'
                }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-main)' }}>Manager's Note:</strong>
                    <span style={{ color: 'var(--text-muted)' }}>"{request.manager_comment}"</span>
                </div>
            )}
        </motion.div>
    )
}

const MyOvertime = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

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
            console.error("Error fetching OT requests:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Overtime</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Log and track your extra hours</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="glass-button"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Plus size={20} /> Log Overtime
                </motion.button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence>
                        {requests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
                                <Clock size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                                <p>No overtime records found.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <OTCard key={req.id} request={req} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}

            <CreateOTModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRequestCreated={fetchRequests}
            />
        </div>
    )
}

export default MyOvertime
