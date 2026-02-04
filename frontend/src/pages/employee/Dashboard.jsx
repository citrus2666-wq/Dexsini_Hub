import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import axios from 'axios'

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-panel"
        style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
    >
        <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{title}</p>
            <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 600 }}>{value}</h3>
        </div>
        <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: `rgb(${color})`
        }}>
            <Icon size={24} />
        </div>
    </motion.div>
)

const EmployeeDashboard = () => {
    const [stats, setStats] = useState({
        pendingLeaves: 0,
        pendingOT: 0,
        approvedLeaves: 0,
        approvedOT: 0
    })

    useEffect(() => {
        // TODO: Implement dedicated employee stats endpoint or fetch lists and count client side
        // For now, using mock or simplified logic
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token')
                // We can reuse the LEAVES endpoint to count
                const leavesRes = await axios.get('/api/v1/leaves/', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const leaves = leavesRes.data

                // We can reuse OT endpoint later
                // const otRes = await axios.get('/api/v1/ot/', { ... })

                setStats({
                    pendingLeaves: leaves.filter(l => l.status === 'PENDING').length,
                    pendingOT: 0, // Placeholder
                    approvedLeaves: leaves.filter(l => l.status === 'APPROVED').length,
                    approvedOT: 0 // Placeholder
                })
            } catch (error) {
                console.error("Error fetching employee stats:", error)
            }
        }
        fetchStats()
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard title="My Pending Leaves" value={stats.pendingLeaves} icon={Calendar} color="255, 180, 0" delay={0.1} />
                <StatCard title="My Approved Leaves" value={stats.approvedLeaves} icon={CheckCircle} color="0, 255, 128" delay={0.2} />
                <StatCard title="My Pending OT" value={stats.pendingOT} icon={Clock} color="255, 0, 85" delay={0.3} />
                <StatCard title="Leave Balance" value="12" icon={Calendar} color="0, 240, 255" delay={0.4} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-panel"
                style={{ padding: '32px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
            >
                <h3 style={{ color: 'var(--text-muted)' }}>Welcome to your Employee Portal</h3>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
                    Here you can view your leave status, apply for new leaves, and manage your overtime claims.
                    Select an option from the sidebar to get started.
                </p>
            </motion.div>
        </div>
    )
}

export default EmployeeDashboard
