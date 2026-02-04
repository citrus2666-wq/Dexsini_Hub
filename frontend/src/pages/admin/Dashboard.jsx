import React from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Clock, CalendarDays } from 'lucide-react'

const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
    return (
        <motion.div
            className="glass-panel"
            whileHover={{ y: -5 }}
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    padding: '10px', borderRadius: '12px',
                    background: `rgba(${color}, 0.1)`, color: `rgb(${color})`
                }}>
                    <Icon size={28} />
                </div>
                {/* <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{value}</span> */}
            </div>

            <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{value}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{title}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{subtext}</span>
            </div>
        </motion.div>
    )
}

const Dashboard = () => {
    const [stats, setStats] = React.useState({
        total_employees: 0,
        pending_leaves: 0,
        pending_ot: 0,
        on_leave_today: 0
    })

    // Fetch stats on mount
    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token')
                // Basic implementation: if 401, maybe redirect (handled by interceptors ideally)
                const res = await fetch('/api/v1/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err)
            }
        }
        fetchStats()
    }, [])

    return (
        <div>
            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <StatCard
                    title="Total Employees"
                    value={stats.total_employees}
                    subtext="Active Users"
                    icon={Users}
                    color="0, 240, 255" // neon cyan
                />
                <StatCard
                    title="On Leave Today"
                    value={stats.on_leave_today}
                    subtext="Absent"
                    icon={CalendarDays}
                    color="255, 0, 85" // neon pink
                />
                <StatCard
                    title="Pending Leaves"
                    value={stats.pending_leaves}
                    subtext="Requires approval"
                    icon={UserCheck}
                    color="112, 0, 255" // neon purple
                />
                <StatCard
                    title="Pending OT Claims"
                    value={stats.pending_ot}
                    subtext="Requires approval"
                    icon={Clock}
                    color="255, 165, 0" // orange
                />
            </div>

            {/* Main Content Split */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Attendance Overview</h3>
                    <div style={{
                        height: '300px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '12px'
                    }}>
                        [Graph Placeholder: Weekly Attendance]
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>On Leave Today</h3>
                    {stats.on_leave_today === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Everybody is present!</p>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Check Leave Management for details.</p>
                    )}
                    {/* 
                      TODO: We can expand the API to return the actual names of people on leave 
                      and render them here similar to the placeholder code.
                    */}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
