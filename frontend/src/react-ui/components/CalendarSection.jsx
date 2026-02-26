import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';
import GlassCard from './GlassCard';
import apiClient from '../../api/client';

const CalendarSection = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        // Fetch all announcements to act as events
        apiClient.get('/announcements')
            .then(({ data }) => {
                if (Array.isArray(data)) {
                    const validEvents = data.filter(ev => ev.date);
                    setEvents(validEvents);
                }
            })
            .catch(err => console.error("Error fetching announcements for calendar:", err));
    }, []);

    // Calendar generation logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        // Adjust so Monday is 0, Sunday is 6
        return day === 0 ? 6 : day - 1;
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["L", "M", "M", "J", "V", "S", "D"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Create array of days to render (padding empty slots before the 1st)
    const renderDays = () => {
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '8px' }}></div>);
        }

        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // Check if this day has events
            const dayEvents = events.filter(ev => ev.date === dateStr);
            const hasEvents = dayEvents.length > 0;

            // Check if this day is today
            const today = new Date();
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            // Check if selected
            const isSelected = selectedDate === dateStr;

            let bgColor = 'transparent';
            let color = theme.colors.text.primary;
            let fontWeight = 'normal';

            if (isSelected) {
                bgColor = theme.colors.primary;
                color = 'white';
                fontWeight = 'bold';
            } else if (hasEvents) {
                bgColor = 'rgba(78, 205, 196, 0.2)'; // Light secondary color
                color = theme.colors.secondary;
                fontWeight = 'bold';
            } else if (isToday) {
                color = theme.colors.primary;
                fontWeight = 'bold';
                bgColor = 'rgba(255,107,107,0.1)';
            }

            days.push(
                <div
                    key={d}
                    onClick={() => {
                        hasEvents ? setSelectedDate(isSelected ? null : dateStr) : setSelectedDate(null);
                    }}
                    style={{
                        padding: '8px',
                        textAlign: 'center',
                        cursor: hasEvents ? 'pointer' : 'default',
                        borderRadius: '8px',
                        background: bgColor,
                        color: color,
                        fontWeight: fontWeight,
                        transition: 'all 0.2s ease',
                        border: isToday && !isSelected ? `1px solid ${theme.colors.primary}` : '1px solid transparent',
                        position: 'relative',
                        fontSize: '0.9rem'
                    }}
                    className={hasEvents ? 'calendar-day-active' : ''}
                >
                    {d}
                    {hasEvents && !isSelected && (
                        <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: theme.colors.secondary
                        }}></div>
                    )}
                </div>
            );
        }
        return days;
    };

    const selectedDayEvents = events.filter(ev => ev.date === selectedDate);

    return (
        <GlassCard className="glass-card calendar-container" style={{ padding: theme.spacing(3), display: 'flex', flexDirection: 'column', height: '100%' }}>

            <style>{`
                .calendar-day-active:hover {
                    background: ${theme.colors.secondary} !important;
                    color: white !important;
                    transform: scale(1.05);
                }
                @media (max-width: 576px) {
                    .calendar-header {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                    .calendar-header h3 {
                        font-size: 1.4rem !important;
                    }
                    .calendar-grid {
                        gap: 4px !important;
                        padding: 12px !important;
                    }
                    .calendar-day {
                        padding: 6px !important;
                        font-size: 0.8rem !important;
                    }
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-3 calendar-header">
                <h3 style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary, margin: 0, fontSize: 'clamp(1.4rem, 4vw, 1.8rem)' }}>
                    <i className="bi bi-calendar3"></i> Eventos
                </h3>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-light rounded-circle shadow-sm" onClick={prevMonth} style={{ width: '32px', height: '32px', padding: 0 }}>
                        <i className="bi bi-chevron-left text-muted"></i>
                    </button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '130px', textAlign: 'center', color: theme.colors.text.primary }}>
                        {monthNames[month]} {year}
                    </span>
                    <button className="btn btn-sm btn-light rounded-circle shadow-sm" onClick={nextMonth} style={{ width: '32px', height: '32px', padding: 0 }}>
                        <i className="bi bi-chevron-right text-muted"></i>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid" style={{ background: '#f8f9fa', borderRadius: '16px', padding: '16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                    {dayNames.map((d, i) => (
                        <div key={i} style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.text.secondary, fontSize: '0.75rem' }}>
                            {d}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {renderDays()}
                </div>
            </div>

            {/* Event Details Panel */}
            <div style={{ marginTop: theme.spacing(3), flexGrow: 1 }}>
                {selectedDate ? (
                    <div style={{ animation: 'fadeIn 0.3s ease-up' }}>
                        <h6 style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: '16px' }}>
                            Eventos del {new Date(selectedDate + 'T00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}:
                        </h6>
                        {selectedDayEvents.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                                {selectedDayEvents.map(ev => (
                                    <div key={ev.id} style={{
                                        background: 'white',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        borderLeft: `4px solid ${theme.colors.secondary}`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}>
                                        <div className="fw-bold mb-1" style={{ color: theme.colors.text.primary, fontSize: '1rem' }}>{ev.title || 'Evento sin título'}</div>
                                        <div className="d-flex flex-wrap gap-3 small text-muted">
                                            {ev.time && <span><i className="bi bi-clock me-1 text-secondary"></i>{ev.time}</span>}
                                            {ev.location && <span><i className="bi bi-geo-alt me-1 text-secondary"></i>{ev.location}</span>}
                                            {ev.tag && <span className="badge bg-light text-dark border">{ev.tag}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted small">No hay detalles para este día.</p>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-muted" style={{ padding: '20px 0', fontSize: '0.9rem' }}>
                        <i className="bi bi-calendar-event fs-2 opacity-25 d-block mb-2"></i>
                        Haz clic en los días marcados para ver los detalles del evento.
                    </div>
                )}
            </div>
            <style>{`
                @keyframes ease-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </GlassCard>
    );
};

export default CalendarSection;
