import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock } from 'lucide-react'
import axios from 'axios'

const CreateOTModal = ({ isOpen, onClose, onRequestCreated }) => {
    const [formData, setFormData] = useState({
        ot_date: '',
        start_time: '',
        end_time: '',
        reason: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Basic validation
            if (!formData.ot_date || !formData.start_time || !formData.end_time || !formData.reason) {
                throw new Error("All fields are required")
            }

            // Append seconds to time for backend compatibility (HH:MM:SS)
            const payload = {
                ...formData,
                start_time: formData.start_time + ":00",
                end_time: formData.end_time + ":00"
            }

            const token = localStorage.getItem('token')
            await axios.post('/api/v1/ot/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            })

            onRequestCreated()
            onClose()
            setFormData({ ot_date: '', start_time: '', end_time: '', reason: '' })
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.detail || err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-panel"
                    style={{
                        width: '450px', padding: '32px', border: '1px solid var(--border-glass)',
                        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Log Overtime</h2>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(255, 0, 85, 0.1)', color: '#ff0055',
                            padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</label>
                            <input
                                type="date"
                                name="ot_date"
                                value={formData.ot_date}
                                onChange={handleChange}
                                className="glass-input"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>End Time</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reason / Work Done</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                className="glass-input"
                                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                                placeholder="Describe the work completed during OT..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button"
                            style={{
                                marginTop: '16px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {loading ? 'Submitting...' : <><Clock size={18} /> Submit Claim</>}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default CreateOTModal
