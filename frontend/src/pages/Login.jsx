import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import api from '../api/axios'
import logo from '../assets/DexsiniLogo_noBG/DexsiniLogo_noBG.jpg'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('username', email)
            formData.append('password', password)

            // 1. Get Access Token
            const response = await api.post('/login/access-token', formData)
            const token = response.data.access_token
            localStorage.setItem('token', token)

            // 2. Get User Profile to check Role
            const userResponse = await api.get('/users/me')
            const user = userResponse.data
            console.log("Login User:", user)

            // 3. Redirect based on Role
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard')
            } else if (user.role === 'MANAGER') {
                navigate('/manager/dashboard')
            } else {
                navigate('/employee/dashboard')
            }

        } catch (err) {
            console.error(err)
            if (!err.response) {
                setError("Network Error: Is the backend server running?")
            } else {
                setError(err.response?.data?.detail || "Login failed")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'var(--color-secondary)',
                borderRadius: '50%',
                opacity: 0.15,
                filter: 'blur(80px)',
                zIndex: -1
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: 'var(--color-primary)',
                borderRadius: '50%',
                opacity: 0.1,
                filter: 'blur(80px)',
                zIndex: -1
            }} />

            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2.5rem',
                    margin: '1rem'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logo} alt="Dexsini Logo" style={{ height: '80px', marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>DEXSINI</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Secure Employee Gateway</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={24} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="Email Address"
                            style={{ paddingLeft: '40px' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={24} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            className="glass-input"
                            placeholder="Password"
                            style={{ paddingLeft: '40px', paddingRight: '40px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)'
                            }}
                        >
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                color: 'var(--color-accent)',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                background: 'rgba(255, 0, 85, 0.1)',
                                padding: '0.5rem',
                                borderRadius: '4px'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        className="glass-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {loading ? 'Authenticating...' : 'Access Hub'}
                        {!loading && <ArrowRight size={22} />}
                    </motion.button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <p>Protected by Dexsini Security Protocols</p>
                </div>
            </motion.div>
        </div>
    )
}

export default Login
