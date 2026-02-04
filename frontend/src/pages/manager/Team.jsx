import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Mail, Phone, Calendar as CalendarIcon, Briefcase, Users } from 'lucide-react'
import axios from 'axios'


const TeamMemberCard = ({ member }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
        className="glass-panel"
        style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
    >
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
            background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {member.full_name.charAt(0)}
                </span>
            </div>
            <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{member.full_name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>{member.designation}</span>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Mail size={16} />
                <span>{member.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Phone size={16} />
                <span>{member.phone_number ? `+91 ${member.phone_number}` : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <CalendarIcon size={16} />
                <span>Joined: {member.join_date ? new Date(member.join_date).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: member.is_active ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 0, 85, 0.1)',
                    color: member.is_active ? 'rgb(0, 255, 128)' : 'rgb(255, 0, 85)',
                    border: member.is_active ? '1px solid rgba(0, 255, 128, 0.2)' : '1px solid rgba(255, 0, 85, 0.2)'
                }}>
                    {member.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </div>
        </div>
    </motion.div>
)

const Team = () => {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchTeam()
    }, [])

    const fetchTeam = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/v1/users/team', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMembers(response.data)
        } catch (error) {
            console.error("Error fetching team:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredMembers = members.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Team</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Overview of your direct reports</p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        className="glass-input"
                        style={{ paddingLeft: '40px', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading team data...</div>
            ) : (
                <>
                    {filteredMembers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>No team members found.</p>
                            <p style={{ fontSize: '0.875rem' }}>Ask an Admin to assign employees to you.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            <AnimatePresence>
                                {filteredMembers.map(member => (
                                    <TeamMemberCard key={member.id} member={member} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Team
