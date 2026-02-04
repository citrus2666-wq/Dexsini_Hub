import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const AddEmployeeModal = ({ isOpen, onClose, onUserAdded }) => {
    const defaultState = {
        full_name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        designation: ''
    }
    const [formData, setFormData] = useState(defaultState)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData(defaultState)
            setError('')
            setShowPassword(false)
        }
    }, [isOpen])

    const handleChange = (e) => {
        let { name, value } = e.target

        // Force Uppercase for Full Name
        if (name === 'full_name') {
            value = value.toUpperCase()
        }

        setFormData({ ...formData, [name]: value })
    }

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address.")
            return
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.")
            return
        }

        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            await axios.post('/api/v1/users/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            onUserAdded()
            onClose()
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.detail || "Failed to create user")
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
                            <h3 style={{ margin: 0 }}>Add New Employee</h3>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }} autoComplete="off">
                            {error && (
                                <div style={{
                                    padding: '10px', background: 'rgba(255, 0, 85, 0.1)',
                                    color: 'var(--color-accent)', borderRadius: '8px', fontSize: '0.9rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name (Uppercase)</label>
                                <input
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="glass-input"
                                    autoComplete="off"
                                    placeholder="JOHN DOE"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="glass-input"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date of Birth</label>
                                <input
                                    name="dob"
                                    type="date"
                                    value={formData.dob || ''}
                                    onChange={handleChange}
                                    className="glass-input"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone Number</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select
                                            className="glass-input"
                                            style={{ width: '100px', padding: '8px', appearance: 'none', textAlign: 'center' }}
                                        >
                                            <option>🇮🇳 +91</option>
                                        </select>
                                        <input
                                            name="phone_number"
                                            type="tel"
                                            value={formData.phone_number || ''}
                                            onChange={handleChange}
                                            className="glass-input"
                                            placeholder="98765 43210"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Join Date</label>
                                    <input
                                        name="join_date"
                                        type="date"
                                        value={formData.join_date || ''}
                                        onChange={handleChange}
                                        className="glass-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Initial Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="glass-input"
                                        autoComplete="new-password"
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)',
                                            display: 'flex'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Role</label>
                                    <select name="role" value={formData.role} onChange={handleChange} className="glass-input" style={{ appearance: 'none' }}>
                                        <option value="EMPLOYEE" style={{ background: '#333' }}>Employee</option>
                                        <option value="MANAGER" style={{ background: '#333' }}>Manager</option>
                                        <option value="ADMIN" style={{ background: '#333' }}>Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Designation</label>
                                    <input name="designation" value={formData.designation} onChange={handleChange} className="glass-input" placeholder="e.g. Developer" />
                                </div>
                            </div>

                            <motion.button
                                className="glass-button"
                                disabled={loading}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 240, 255, 0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            >
                                {loading ? 'Creating...' : <><Save size={18} /> Create Employee</>}
                            </motion.button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AddEmployeeModal
