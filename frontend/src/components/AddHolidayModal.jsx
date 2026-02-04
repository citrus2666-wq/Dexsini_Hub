import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarPlus } from 'lucide-react'
import axios from 'axios'

const AddHolidayModal = ({ isOpen, onClose, onHolidayAdded }) => {
    const defaultState = {
        name: '',
        date: '',
        is_recurring: true
    }
    const [formData, setFormData] = useState(defaultState)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            await axios.post('/api/v1/leaves/holidays', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            onHolidayAdded()
            onClose()
            setFormData(defaultState)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.detail || "Failed to add holiday")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
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

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                        className="glass-panel"
                        style={{
                            position: 'fixed', top: '50%', left: '50%',
                            width: '90%', maxWidth: '400px', padding: '0', zIndex: 100, border: '1px solid var(--border-highlight)',
                            display: 'flex', flexDirection: 'column', maxHeight: '90vh'
                        }}
                    >
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <h3 style={{ margin: 0 }}>Add Holiday</h3>
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
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Holiday Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. New Year's Day"
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="glass-input"
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="checkbox"
                                    name="is_recurring"
                                    checked={formData.is_recurring}
                                    onChange={handleChange}
                                    id="recurring"
                                    style={{ width: '16px', height: '16px' }}
                                />
                                <label htmlFor="recurring" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Recurring (Yearly)</label>
                            </div>

                            <motion.button
                                className="glass-button"
                                disabled={loading}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 240, 255, 0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            >
                                {loading ? 'Saving...' : <><CalendarPlus size={18} /> Add Holiday</>}
                            </motion.button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AddHolidayModal
