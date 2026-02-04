import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarPlus } from 'lucide-react'
import axios from 'axios'

const CreateLeaveModal = ({ isOpen, onClose, onRequestCreated }) => {
    const defaultState = {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: ''
    }
    const [formData, setFormData] = useState(defaultState)
    const [leaveTypes, setLeaveTypes] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setFormData(defaultState)
            setError('')
            fetchLeaveTypes()
        }
    }, [isOpen])

    const fetchLeaveTypes = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/v1/leaves/types', {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Fallback data
            const fallbackTypes = [
                { id: 1, name: 'Sick Leave', default_days_per_year: 12 },
                { id: 2, name: 'Week Off', default_days_per_year: 104 },
                { id: 3, name: 'Annual Leave', default_days_per_year: 20 },
                { id: 4, name: 'Leave in OT', default_days_per_year: 0 },
                { id: 5, name: 'Work From Home', default_days_per_year: 365 }
            ]

            if (response.data && response.data.length > 0) {
                setLeaveTypes(response.data)
                setFormData(prev => ({ ...prev, leave_type_id: prev.leave_type_id || response.data[0].id }))
            } else {
                // If backend returns empty list (e.g. DB issue), use fallback
                console.warn("Backend returned 0 leave types, using fallback.")
                setLeaveTypes(fallbackTypes)
                setFormData(prev => ({ ...prev, leave_type_id: prev.leave_type_id || fallbackTypes[0].id }))
            }
        } catch (err) {
            console.error("Failed to fetch leave types", err)
            // Fallback for network error
            const fallbackTypes = [
                { id: 1, name: 'Sick Leave', default_days_per_year: 12 },
                { id: 2, name: 'Week Off', default_days_per_year: 104 },
                { id: 3, name: 'Annual Leave', default_days_per_year: 20 },
                { id: 4, name: 'Leave in OT', default_days_per_year: 0 },
                { id: 5, name: 'Work From Home', default_days_per_year: 365 }
            ]
            setLeaveTypes(fallbackTypes)
            setFormData(prev => ({ ...prev, leave_type_id: fallbackTypes[0].id }))
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Payload preparation with type casting
        const leaveTypeId = parseInt(formData.leave_type_id, 10)

        if (isNaN(leaveTypeId)) {
            setError("Please select a valid Leave Type.")
            setLoading(false)
            return
        }

        const payload = {
            ...formData,
            leave_type_id: leaveTypeId,
            // Ensure dates are strings (should be already, but just in case)
            start_date: formData.start_date,
            end_date: formData.end_date
        }

        console.log("Submitting Leave Request:", payload)

        try {
            const token = localStorage.getItem('token')
            await axios.post('/api/v1/leaves/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            })
            onRequestCreated()
            onClose()
        } catch (err) {
            console.error(err)
            // Enhanced error display
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                // Pydantic validation errors often come as array
                setError(detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', '))
            } else {
                setError(detail || "Failed to create leave request")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 50
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                        className="glass-panel"
                        style={{
                            position: 'fixed', top: '50%', left: '50%',
                            width: '90%', maxWidth: '500px', padding: '0', zIndex: 100, border: '1px solid var(--border-highlight)',
                            display: 'flex', flexDirection: 'column', maxHeight: '90vh'
                        }}
                    >
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <h3 style={{ margin: 0 }}>Create Leave Request</h3>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                            {error && (
                                <div style={{
                                    padding: '10px', background: 'rgba(255, 0, 85, 0.1)',
                                    color: 'var(--color-accent)', borderRadius: '8px', fontSize: '0.9rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Leave Type</label>
                                <select
                                    name="leave_type_id"
                                    value={formData.leave_type_id}
                                    onChange={handleChange}
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                >
                                    {leaveTypes.length === 0 && <option value="" disabled>Loading types...</option>}
                                    {leaveTypes.map(type => (
                                        <option key={type.id} value={type.id} style={{ background: '#1a1a1a', color: 'white' }}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        className="glass-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                        className="glass-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reason (Optional)</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    className="glass-input"
                                    rows="3"
                                    placeholder="e.g. Family Function"
                                />
                            </div>

                            <motion.button
                                className="glass-button"
                                disabled={loading}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 240, 255, 0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            >
                                {loading ? 'Submitting...' : <><CalendarPlus size={18} /> Submit Request</>}
                            </motion.button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default CreateLeaveModal
