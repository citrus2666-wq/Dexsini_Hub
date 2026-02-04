import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Download, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns'
import axios from 'axios'
import AddHolidayModal from '../../components/AddHolidayModal'

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLeave, setSelectedLeave] = useState(null)
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false)

    useEffect(() => {
        fetchLeaves()
    }, [currentDate])

    const fetchLeaves = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            // Fetch all leaves (Admin endpoint returns all)
            const response = await axios.get('/api/v1/leaves/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Filter strictly for testing/demo or use all
            setLeaves(response.data.filter(l => l.status === 'APPROVED'))
        } catch (error) {
            console.error("Error fetching leaves:", error)
        } finally {
            setLoading(false)
        }
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const today = () => setCurrentDate(new Date())

    // Calendar Generation Logic
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
    const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Helper to find leaves for a day
    const getLeavesForDay = (day) => {
        return leaves.filter(leave => {
            const start = parseISO(leave.start_date)
            const end = parseISO(leave.end_date)
            return isWithinInterval(day, { start, end })
        })
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CalendarIcon size={32} color="var(--color-primary)" />
                        Master Calendar
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Overview of all employee leaves</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '12px' }}>
                        <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: 'white', padding: '8px', cursor: 'pointer' }}>
                            <ChevronLeft />
                        </button>
                        <span style={{ minWidth: '150px', textAlign: 'center', fontWeight: 600, fontSize: '1.1rem' }}>
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: 'white', padding: '8px', cursor: 'pointer' }}>
                            <ChevronRight />
                        </button>
                    </div>
                    <button onClick={today} className="glass-button">Today</button>
                    <button
                        onClick={() => setIsHolidayModalOpen(true)}
                        className="glass-button"
                        style={{ marginLeft: '12px', display: 'flex', gap: '8px' }}
                    >
                        <Plus size={18} /> Add Holiday
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Week Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                    {weeks.map(day => (
                        <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', flex: 1, gap: '8px' }}>
                    {calendarDays.map((day, idx) => {
                        const dayLeaves = getLeavesForDay(day)
                        const isToday = isSameDay(day, new Date())
                        const isCurrentMonth = isSameMonth(day, monthStart)

                        return (
                            <div
                                key={day.toString()}
                                style={{
                                    background: isCurrentMonth ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    border: isToday ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
                                    opacity: isCurrentMonth ? 1 : 0.3,
                                    display: 'flex', flexDirection: 'column', gap: '4px',
                                    minHeight: '0', overflowY: 'auto'
                                }}
                            >
                                <span style={{
                                    fontSize: '0.9rem', fontWeight: isToday ? 700 : 400,
                                    color: isToday ? 'var(--color-primary)' : 'inherit',
                                    display: 'block', marginBottom: '4px'
                                }}>
                                    {format(day, 'd')}
                                </span>

                                {dayLeaves.map(leave => (
                                    <motion.div
                                        key={leave.id}
                                        layoutId={leave.id}
                                        onClick={() => setSelectedLeave(leave)}
                                        whileHover={{ scale: 1.02 }}
                                        style={{
                                            fontSize: '0.75rem',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: leave.leave_type?.color_hex || '#444',
                                            color: '#fff',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        title={`${leave.user?.full_name} - ${leave.leave_type?.name}`}
                                    >
                                        {leave.user?.full_name}
                                    </motion.div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Detail Modal (Simple Overlay) */}
            <AnimatePresence>
                {selectedLeave && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedLeave(null)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-panel"
                            style={{ width: '400px', padding: '32px', border: `1px solid ${selectedLeave.leave_type?.color_hex}` }}
                        >
                            <h2 style={{ margin: '0 0 8px 0' }}>{selectedLeave.user?.full_name}</h2>
                            <span style={{
                                background: selectedLeave.leave_type?.color_hex, padding: '4px 12px', borderRadius: '100px',
                                fontSize: '0.8rem', fontWeight: 600
                            }}>
                                {selectedLeave.leave_type?.name}
                            </span>

                            <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Dates</span>
                                    <span>{selectedLeave.start_date} to {selectedLeave.end_date}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Days</span>
                                    <span>{selectedLeave.total_days}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Reason</span>
                                    <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.9rem' }}>"{selectedLeave.reason}"</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedLeave(null)}
                                className="glass-button"
                                style={{ width: '100%', marginTop: '32px', justifyContent: 'center' }}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AddHolidayModal
                isOpen={isHolidayModalOpen}
                onClose={() => setIsHolidayModalOpen(false)}
                onHolidayAdded={() => { }}
            />
        </div>
    )
}

export default Calendar
