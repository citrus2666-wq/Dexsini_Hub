import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, Calendar, Clock,
    LogOut, Menu, X, User
} from 'lucide-react'

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => {
    const navigate = useNavigate()

    return (
        <motion.div
            onClick={() => navigate(path)}
            whileHover={{ x: 5, backgroundColor: 'rgba(3, 24, 90, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            style={{
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px' : '12px 16px',
                marginBottom: '8px',
                cursor: 'pointer',
                borderRadius: '8px',
                color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                background: active ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                border: active ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                fontWeight: active ? 600 : 400
            }}
        >
            <Icon size={24} style={{ marginRight: collapsed ? 0 : '12px', color: active ? 'var(--color-secondary)' : 'currentColor', flexShrink: 0 }} />
            <span>{label}</span>
            {active && (
                <motion.div
                    layoutId="activeIndicator"
                    style={{
                        position: 'absolute',
                        left: 0,
                        width: '4px',
                        height: '24px',
                        backgroundColor: 'var(--color-secondary)',
                        borderRadius: '0 4px 4px 0'
                    }}
                />
            )}
        </motion.div>
    )
}

const EmployeeLayout = () => {
    // ... logic same ...
    const navigate = useNavigate()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/employee/dashboard' },
        { icon: Calendar, label: 'My Leaves', path: '/employee/leaves' },
        { icon: Clock, label: 'My Overtime', path: '/employee/overtime' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-deep)' }}>
            {/* Sidebar */}
            <motion.div
                animate={{ width: isSidebarOpen ? '260px' : '80px' }}
                className="glass-panel"
                style={{
                    height: '100%',
                    borderRadius: 0,
                    borderRight: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 10,
                    background: '#ffffff'
                }}
            >
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
                    {isSidebarOpen && (
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ fontSize: '1.25rem', color: 'var(--color-primary)', letterSpacing: '-0.5px' }}
                        >
                            DEXSINI
                        </motion.h2>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
                    {sidebarItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                            label={isSidebarOpen ? item.label : ''}
                            collapsed={!isSidebarOpen}
                        />
                    ))}
                </div>

                <div style={{ padding: '16px' }}>
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={24} style={{ marginRight: isSidebarOpen ? '12px' : 0 }} />
                        {isSidebarOpen && <span>Logout</span>}
                    </motion.button>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {/* Header */}
                <header style={{
                    height: '70px',
                    borderBottom: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                        {sidebarItems.find(i => i.path === location.pathname)?.label || 'Portal'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--color-primary)',
                            color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 600,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            E
                        </div>
                        <span style={{ fontSize: '0.9rem' }}>Employee</span>
                    </div>
                </header>

                {/* Content Scrollable Area */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default EmployeeLayout
