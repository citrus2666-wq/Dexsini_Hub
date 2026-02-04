import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, Calendar, CheckCircle } from 'lucide-react'
import axios from 'axios'

// Reusing StatCard from Admin Dashboard for consistency
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

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        myTeam: 0,
        pendingLeaves: 0,
        pendingOT: 0,
        approvedToday: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get('/api/v1/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                // Map backend keys to frontend state
                const data = response.data
                setStats({
                    myTeam: data.total_employees, // "total_employees" key is overloaded in backend to mean team count for manager
                    pendingLeaves: data.pending_leaves,
                    pendingOT: data.pending_ot,
                    approvedToday: data.on_leave_today // Using "on_leave_today" as the 4th stat for now
                })
            } catch (error) {
                console.error("Error fetching manager stats:", error)
            }
        }
        fetchStats()
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard title="My Team Members" value={stats.myTeam} icon={Users} color="0, 240, 255" delay={0.1} />
                <StatCard title="Pending Leave Requests" value={stats.pendingLeaves} icon={Calendar} color="255, 0, 85" delay={0.2} />
                <StatCard title="Pending OT Claims" value={stats.pendingOT} icon={Clock} color="255, 180, 0" delay={0.3} />
                <StatCard title="Approved Today" value={stats.approvedToday} icon={CheckCircle} color="0, 255, 128" delay={0.4} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-panel"
                style={{ padding: '32px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
            >
                <h3 style={{ color: 'var(--text-muted)' }}>Team Activity Chart (Coming Soon)</h3>
            </motion.div>
        </div>
    )
}

export default ManagerDashboard
