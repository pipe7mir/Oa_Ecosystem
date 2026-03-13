import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useTheme } from '../react-ui/ThemeContext';
import GlassCard from '../react-ui/components/GlassCard';
import apiClient from '../api/client';
import { useToast } from '../react-ui/components/Toast';
import ConfirmationModal from '../react-ui/components/ConfirmationModal';
import { 
    Clock, 
    User, 
    Plus, 
    Trash2, 
    CheckCircle, 
    AlertCircle,
    Calendar as CalendarIcon,
    Bell,
    Users as UsersIcon,
    Music,
    Upload,
    Play,
    Pause,
    SkipForward,
    Download,
    FileSpreadsheet,
    UserPlus,
    X,
    Check,
    Box,
    ChevronUp,
    ChevronDown,
    LayoutDashboard
} from 'lucide-react';

// --- Constants & Styles ---
const PURPLE_AMETHYST = '#6D28D9';
const PURPLE_LIGHT = '#A78BFA';
const SUCCESS_GREEN = '#10B981';

const CircularProgress = ({ percentage, size = 200, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Color transition: 0% (Green) -> 100% (Purple)
    const color = percentage > 80 ? PURPLE_LIGHT : SUCCESS_GREEN;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
                fill="transparent"
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, ease: "linear" }}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
            />
        </svg>
    );
};

const AdminCulto = () => {
    const { theme, mode } = useTheme();
    const isDark = mode === 'dark';
    const [orden, setOrden] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [serviceStartTime, setServiceStartTime] = useState(null);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [liveSettings, setLiveSettings] = useState({ title: '', description: '' });
    const { showToast } = useToast();
    
    const [confirmConfig, setConfirmConfig] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning'
    });

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('planning'); // 'planning' or 'monthly'

    const [formData, setFormData] = useState({
        actividad: '', responsable: '', hora: '', duracionEstimada: 5,
        cantidadPersonas: 1, participantes: '', esGrupoEspecial: false, necesitaPianista: false,
        fecha: selectedDate
    });

    const resetForm = () => {
        setFormData({
            actividad: '', responsable: '', hora: '', duracionEstimada: 5,
            cantidadPersonas: 1, participantes: '', esGrupoEspecial: false, necesitaPianista: false,
            fecha: selectedDate
        });
    };

    // --- Computed State ---
    const filteredOrden = useMemo(() => {
        return orden.filter(item => item.fecha === selectedDate || (!item.fecha && selectedDate === new Date().toISOString().split('T')[0]));
    }, [orden, selectedDate]);

    const monthlySummary = useMemo(() => {
        const summary = {};
        orden.forEach(item => {
            if (item.fecha) {
                const month = item.fecha.substring(0, 7);
                if (!summary[month]) summary[month] = {};
                if (!summary[month][item.fecha]) summary[month][item.fecha] = 0;
                summary[month][item.fecha]++;
            }
        });
        return summary;
    }, [orden]);

    // --- Effects ---
    useEffect(() => {
        fetchOrden();
        fetchLiveSettings();
        fetchStats();
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        // Polling para estadísticas y sincronización de estado global
        const syncInterval = setInterval(() => {
            fetchStats();
            if (!serviceStartTime) fetchLiveSettings(); // Solo poll si no estamos activamente controlando
        }, 10000);

        return () => {
            clearInterval(clockInterval);
            clearInterval(syncInterval);
        };
    }, [serviceStartTime]); // Re-suscribir si cambia el estado local

    useEffect(() => {
        let timer;
        if (serviceStartTime && !isPaused) {
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [serviceStartTime, isPaused]);

    // EFECTO DE AUTO-RECUPERACIÓN: Si el backend dice que estamos EN VIVO, restaurar estado local
    useEffect(() => {
        const canRecover = !serviceStartTime && 
                          liveSettings?.stream_is_live === 'true' && 
                          liveSettings?.current_activity_id && 
                          filteredOrden.length > 0;

        if (canRecover) {
            const foundIdx = filteredOrden.findIndex(item => item.id.toString() === liveSettings.current_activity_id.toString());
            if (foundIdx !== -1) {
                console.log('🔄 Sincronizando sesión activa desde el servidor (Actividad ID:', liveSettings.current_activity_id, ')');
                
                setCurrentActivityIndex(foundIdx);
                
                if (liveSettings.activity_start_time && liveSettings.activity_start_time !== '') {
                    const serverStart = new Date(liveSettings.activity_start_time).getTime();
                    
                    if (!isNaN(serverStart)) {
                        const isPausedServer = liveSettings.is_paused === 'true';
                        
                        if (isPausedServer) {
                            setIsPaused(true);
                            setElapsedSeconds(parseInt(liveSettings.paused_at_seconds || '0'));
                        } else {
                            // Calcular tiempo transcurrido exacto
                            const elapsed = Math.floor((Date.now() - serverStart) / 1000);
                            setIsPaused(false);
                            setElapsedSeconds(Math.max(0, elapsed));
                        }
                    }
                }

                // Activar el control local sin resetear valores
                setServiceStartTime(new Date()); 
                if (viewMode === 'planning' || viewMode === 'monthly') {
                    setViewMode('live'); // Llevar al admin a la pantalla de control
                }
            }
        }
    }, [liveSettings, filteredOrden, serviceStartTime, viewMode]);

    useEffect(() => {
        const checkInterval = setInterval(checkAlerts, 10000);
        return () => clearInterval(checkInterval);
    }, [orden, alerts]);

    // --- Logic ---
    const fetchOrden = async () => {
        try {
            const { data } = await apiClient.get('/orden-culto');
            setOrden(data.sort((a, b) => a.hora.localeCompare(b.hora)));
        } catch (e) {
            console.error('Error fetching orden:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveSettings = async () => {
        try {
            const { data } = await apiClient.get('/public/settings');
            // Store raw settings object for recovery logic
            setLiveSettings(data);
        } catch (e) {
            console.error('Error fetching live settings:', e);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await apiClient.get('/public/stats');
            setOnlineUsers(data.onlineUsers || 0);
        } catch (e) {
            console.error('Error fetching stats:', e);
        }
    };

    const checkAlerts = () => {
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const nextEvents = orden.filter(item => !item.completado && item.hora > currentHHMM);
        
        nextEvents.forEach(event => {
            const [h, m] = event.hora.split(':').map(Number);
            const eventTime = new Date();
            eventTime.setHours(h, m, 0, 0);
            const diffInMinutes = (eventTime - now) / 1000 / 60;
            
            if (diffInMinutes > 0 && diffInMinutes <= 5) {
                const alertId = `alert-${event.id}`;
                if (!alerts.some(a => a.id === alertId)) {
                    setAlerts(prev => [...prev, { 
                        id: alertId, 
                        message: `¡Alerta! Próximo evento: "${event.actividad}" en menos de 5 minutos (${event.hora}).`
                    }]);
                    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== alertId)), 60000);
                }
            }
        });
    };

    const handleCreate = async (e) => {
        if (e) e.preventDefault();
        try {
            await apiClient.post('/orden-culto', { ...formData, fecha: selectedDate });
            setFormData({ actividad: '', responsable: '', hora: '', duracionEstimada: 5, cantidadPersonas: 1, participantes: '', esGrupoEspecial: false, necesitaPianista: false, fecha: selectedDate });
            setShowForm(false);
            fetchOrden();
            showToast('Actividad agregada', 'success');
        } catch (e) { showToast('Error al crear', 'error'); }
    };


    const handleImport = async (text) => {
        const raw = text || importData;
        const lines = raw.split('\n').filter(l => l.trim() !== '');
        try {
            let count = 0;
            for (let line of lines) {
                const parts = line.split(',').map(s => s.trim());
                if (parts.length >= 3) {
                    const [act, resp, hr, dur, fec] = parts;
                    await apiClient.post('/orden-culto', {
                        actividad: act, 
                        responsable: resp || 'Por asignar', 
                        hora: hr, 
                        duracionEstimada: parseInt(dur) || 5,
                        fecha: fec || selectedDate
                    });
                    count++;
                }
            }
            setShowImport(false);
            setImportData('');
            fetchOrden();
            showToast(`Se importaron ${count} bloques con éxito`, 'success');
        } catch (e) { 
            console.error('Import error:', e);
            showToast('Error en importación. Verifica el formato.', 'error'); 
        }
    };

    const handleExcelImport = async (file) => {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                // raw: true to get values, cellDates: true might help but header: 1 is simple
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const ws = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }); // raw: false gets formatted strings
                
                const rows = json.slice(1);
                let count = 0;
                for (let row of rows) {
                    if (row[0] && row[2]) {
                        // row[2] should be the time. With raw:false it should be a string like "09:00"
                        let timeStr = row[2].toString();
                        // Basic cleanup for HH:mm
                        if (timeStr.includes(':')) {
                            const [h, m] = timeStr.split(':');
                            timeStr = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
                        }

                        await apiClient.post('/orden-culto', {
                            actividad: row[0],
                            responsable: row[1] || 'Por asignar',
                            hora: timeStr,
                            duracionEstimada: parseInt(row[3]) || 5,
                            fecha: row[4] ? row[4].toString() : selectedDate
                        });
                        count++;
                    }
                }
                fetchOrden();
                showToast(`${count} actividades cargadas desde el archivo`, 'success');
            };
            reader.readAsArrayBuffer(file);
        } catch (e) { 
            console.error('Excel error:', e);
            showToast('No se pudo procesar el Excel', 'error'); 
        }
    };

    const downloadTemplate = () => {
        const wsData = [
            ["Actividad", "Responsable", "Hora (HH:MM)", "Duración (min)", "Fecha (AAAA-MM-DD)"],
            ["Ej: Preludio", "Pianista", "09:00", "10", selectedDate],
            ["Ej: Sermón", "Pastor", "11:00", "40", selectedDate]
        ];
        // Create worksheet and ensure proper format
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Ensure durations and times are treated as text/strings to avoid Excel formatting issues
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_ref = XLSX.utils.encode_cell({c:C, r:R});
                if (!ws[cell_ref]) continue;
                ws[cell_ref].z = '@'; // Set format to Text
                ws[cell_ref].t = 's'; // Force type to String
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "OrdenCulto");
        XLSX.writeFile(wb, "Plantilla_Orden_Culto_Oasis.xlsx");
    };

    const exportCurrentOrden = () => {
        if (filteredOrden.length === 0) {
            showToast('No hay datos para exportar en esta fecha', 'warning');
            return;
        }
        // Export ONLY the current table data
        const wsData = [
            ["Actividad", "Responsable", "Hora", "Duración (min)", "Fecha"],
            ...filteredOrden.map(item => [item.actividad, item.responsable, item.hora, item.duracionEstimada, item.fecha])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Force all cells to text format for consistency
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_ref = XLSX.utils.encode_cell({c:C, r:R});
                if (!ws[cell_ref]) continue;
                ws[cell_ref].z = '@';
                ws[cell_ref].t = 's';
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ProgramaActual");
        XLSX.writeFile(wb, `Tabla_Culto_${selectedDate}.xlsx`);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const moveActivity = async (index, direction) => {
        const newOrden = [...orden];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newOrden.length) return;
        
        // Swap locally for instant feedback
        [newOrden[index], newOrden[targetIndex]] = [newOrden[targetIndex], newOrden[index]];
        setOrden(newOrden);
        
        // In a real scenario, we'd update positions in DB. 
        // For now, since we sort by time, we might need to adjust times or have a 'position' field.
        // As per current 'findAll' in backend, it sorts by 'hora'.
        showToast('Orden actualizado (basado en hora)', 'info');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            handleExcelImport(file);
        } else if (file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (re) => handleImport(re.target.result);
            reader.readAsText(file);
        } else {
            showToast('Utiliza archivos .xlsx, .xls o .csv', 'warning');
        }
    };

    const syncLiveActivity = async (activityId, isLiveAction = true, extra = {}) => {
        try {
            const payload = { 
                current_activity_id: activityId ? activityId.toString() : '',
                stream_is_live: isLiveAction ? 'true' : 'false',
                ...extra
            };
            await apiClient.post('/settings', payload);
        } catch (e) {
            console.error('Error syncing live activity:', e);
        }
    };

    const startService = () => {
        setConfirmConfig({
            show: true,
            title: '¿Iniciar cronómetro para el servicio?',
            message: 'Esto activará el Panel de Culto en Curso y sincronizará los tiempos de todas las actividades programadas.',
            type: 'warning',
            onConfirm: () => {
                const now = new Date();
                setServiceStartTime(now);
                setElapsedSeconds(0);
                setCurrentActivityIndex(0);
                setIsPaused(false);
                setConfirmConfig(prev => ({ ...prev, show: false }));
                setViewMode('live');
                
                // Sincronizar con el backend para la vista pública
                if (filteredOrden.length > 0) {
                    syncLiveActivity(filteredOrden[0].id, true, {
                        activity_start_time: now.toISOString(),
                        is_paused: 'false',
                        paused_at_seconds: '0'
                    });
                }
                
                showToast('Servicio iniciado', 'success');
            }
        });
    };

    const stopService = () => {
        setConfirmConfig({
            show: true,
            title: '¿Detener el servicio el curso?',
            message: 'Esto reiniciará el cronómetro y cerrará el panel de control en vivo.',
            type: 'danger',
            onConfirm: () => {
                setServiceStartTime(null);
                setElapsedSeconds(0);
                setIsPaused(false);
                setViewMode('planning');
                setConfirmConfig(prev => ({ ...prev, show: false }));
                
                // Desactivar estado en el backend y limpiar tiempos
                syncLiveActivity(null, false, {
                    activity_start_time: '',
                    is_paused: 'false',
                    paused_at_seconds: '0'
                });
                
                showToast('Servicio finalizado', 'info');
            }
        });
    };

    const currentActivity = useMemo(() => filteredOrden[currentActivityIndex], [filteredOrden, currentActivityIndex]);
    const progressPercentage = useMemo(() => {
        if (!currentActivity) return 0;
        const totalSecs = currentActivity.duracionEstimada * 60;
        return Math.min((elapsedSeconds / totalSecs) * 100, 100);
    }, [currentActivity, elapsedSeconds]);

    const nextActivity = () => {
        if (currentActivityIndex < filteredOrden.length - 1) {
            const nextIdx = currentActivityIndex + 1;
            const now = new Date();
            setCurrentActivityIndex(nextIdx);
            setElapsedSeconds(0);
            setIsPaused(false);
            
            // Sincronizar con el backend
            if (filteredOrden[nextIdx]) {
                syncLiveActivity(filteredOrden[nextIdx].id, true, {
                    activity_start_time: now.toISOString(),
                    is_paused: 'false',
                    paused_at_seconds: '0'
                });
            }
        } else {
            showToast('Fin del orden del culto', 'info');
            setServiceStartTime(null);
            syncLiveActivity(null, false);
        }
    };

    const togglePause = () => {
        const newPaused = !isPaused;
        setIsPaused(newPaused);
        syncLiveActivity(currentActivity?.id, true, { 
            is_paused: newPaused ? 'true' : 'false',
            paused_at_seconds: elapsedSeconds.toString()
        });
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // --- Render Elements ---
    const renderHeader = () => (
        <header className="mb-4 p-4 d-flex justify-content-between align-items-center" 
            style={{ 
                background: theme.glass.background,
                backdropFilter: theme.glass.backdropFilter,
                border: theme.glass.border,
                borderRadius: '24px',
                boxShadow: theme.shadows.soft
            }}>
            <div className="d-flex flex-column">
                <h1 style={{ 
                    fontWeight: 900, 
                    fontSize: '2.2rem', 
                    fontFamily: theme.fonts.accent, 
                    color: isDark ? '#FFFFFF' : '#000000', 
                    margin: 0, 
                    textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.3)' : 'none' 
                }}>
                    ORDEN <span style={{ color: PURPLE_AMETHYST }}>DEL CULTO</span>
                </h1>
                <div className="d-flex align-items-center gap-3 mt-1">
                    <p className="small mb-0 fw-600" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                        Gestión en tiempo real
                    </p>
                    <div className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill" 
                        style={{ 
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` 
                        }}>
                        <UsersIcon size={12} color={PURPLE_AMETHYST} />
                        <span className="x-small fw-bold" style={{ color: isDark ? '#FFF' : '#000' }}>{onlineUsers} Conectados</span>
                    </div>
                </div>
            </div>
            <div className="d-flex gap-2">
                <div className="d-flex align-items-center rounded-pill px-2 border" 
                    style={{ 
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderColor: theme.colors.border 
                    }}>
                    <button onClick={() => setViewMode('planning')} className={`btn btn-sm rounded-pill px-3 fw-bold ${viewMode === 'planning' ? 'text-white' : ''}`} 
                        style={{ 
                            background: viewMode === 'planning' ? PURPLE_AMETHYST : 'transparent',
                            color: viewMode === 'planning' ? '#FFF' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                        }}>Día</button>
                    {serviceStartTime && (
                        <button onClick={() => setViewMode('live')} className={`btn btn-sm rounded-pill px-3 fw-bold ${viewMode === 'live' ? 'text-white' : ''}`} 
                            style={{ 
                                background: viewMode === 'live' ? '#ef4444' : 'transparent',
                                color: viewMode === 'live' ? '#FFF' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                            }}>
                            <span className="pulse-dot-red me-1"></span> EN VIVO
                        </button>
                    )}
                    <button onClick={() => setViewMode('monthly')} className={`btn btn-sm rounded-pill px-3 fw-bold ${viewMode === 'monthly' ? 'text-white' : ''}`} 
                        style={{ 
                            background: viewMode === 'monthly' ? PURPLE_AMETHYST : 'transparent',
                            color: viewMode === 'monthly' ? '#FFF' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                        }}>Mes</button>
                </div>
                <div className="px-3 py-2 rounded-4 d-flex align-items-center gap-2" 
                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${theme.colors.border}` }}>
                    <CalendarIcon size={16} color={PURPLE_AMETHYST} />
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-0 bg-transparent fw-bold small outline-none"
                        style={{ color: isDark ? '#FFF' : '#000' }}
                    />
                </div>
                {!serviceStartTime && (
                    <button onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }} className={`btn rounded-pill px-4 fw-bold text-white shadow-lg border-0 ${!showForm ? 'animate-pulse' : ''}`} 
                        style={{ background: showForm ? theme.colors.text.secondary : PURPLE_AMETHYST, transition: 'all 0.3s' }}>
                        {showForm ? <><X size={18} className="me-2" /> Cerrar</> : <><Plus size={18} className="me-2" /> Agregar Actividad</>}
                    </button>
                )}
            </div>
            <style>{`
                .animate-pulse { animation: pulse-purple 2s infinite; }
                @keyframes pulse-purple {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(109, 40, 217, 0.4); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(109, 40, 217, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(109, 40, 217, 0); }
                }
                .pulse-dot-red {
                    display: inline-block;
                    width: 7px; height: 7px;
                    background: #ff4d4d;
                    border-radius: 50%;
                    animation: blink 1s infinite;
                }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
            `}</style>
        </header>
    );

    const renderActivityForm = () => (
        <AnimatePresence>
            {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                    <GlassCard style={{ padding: '30px', border: `2px solid ${PURPLE_AMETHYST}20` }}>
                        <form onSubmit={handleCreate} className="row g-4">
                            <div className="col-12 mb-2 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0" style={{ color: PURPLE_AMETHYST }}>Nueva Actividad para el {selectedDate}</h5>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-sm btn-light rounded-circle"><X size={16} /></button>
                            </div>
                            <div className="col-md-6">
                                <label className="small fw-bold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)' }}>Nombre de Actividad</label>
                                <input 
                                    type="text" required className="form-control rounded-4 border-0 bg-light-soft p-3" 
                                    placeholder="Ej: Sermón, Alabanza, etc."
                                    value={formData.actividad} onChange={e => setFormData({...formData, actividad: e.target.value})}
                                    style={{ color: isDark ? '#FFF' : '#000' }}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="small fw-bold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)' }}>Responsable / Persona</label>
                                <input 
                                    type="text" required className="form-control rounded-4 border-0 bg-light-soft p-3" 
                                    placeholder="Nombre del pastor o grupo"
                                    value={formData.responsable} onChange={e => setFormData({...formData, responsable: e.target.value})}
                                    style={{ color: isDark ? '#FFF' : '#000' }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="small fw-bold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)' }}>Hora de Inicio (Reloj Visual)</label>
                                <input 
                                    type="time" required className="form-control rounded-4 border-0 bg-light-soft p-3 fw-bold" 
                                    value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})}
                                    style={{ color: isDark ? '#FFF' : '#000' }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="small fw-bold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)' }}>Duración (min)</label>
                                <div className="d-flex align-items-center gap-3">
                                    <input 
                                        type="range" min="1" max="120" step="5" className="form-range flex-grow-1"
                                        value={formData.duracionEstimada} onChange={e => setFormData({...formData, duracionEstimada: e.target.value})}
                                    />
                                    <span className="badge rounded-pill p-2 px-3 bg-dark text-white fw-bold">{formData.duracionEstimada}m</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="small fw-bold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)' }}>Cantidad de Personas</label>
                                <input 
                                    type="number" className="form-control rounded-4 border-0 bg-light-soft p-3" 
                                    value={formData.cantidadPersonas} onChange={e => setFormData({...formData, cantidadPersonas: e.target.value})}
                                    style={{ color: isDark ? '#FFF' : '#000' }}
                                />
                            </div>
                            <div className="col-12 py-2">
                                <div className="d-flex gap-4">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="pianistSwitch" checked={formData.necesitaPianista} onChange={e => setFormData({...formData, necesitaPianista: e.target.checked})} />
                                        <label className="form-check-label small fw-bold" htmlFor="pianistSwitch" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#000' }}>Necesita Pianista</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="specialSwitch" checked={formData.esGrupoEspecial} onChange={e => setFormData({...formData, esGrupoEspecial: e.target.checked})} />
                                        <label className="form-check-label small fw-bold" htmlFor="specialSwitch" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#000' }}>Grupo Especial</label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 text-end">
                                <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-lg py-3" style={{ background: PURPLE_AMETHYST }}>
                                    Confirmar y Guardar Actividad
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderPlanningView = () => (
        <div className="row g-4">
            {/* Main Builder Form */}
            <div className="col-12">
                {renderActivityForm()}
            </div>
            
            <div className={`col-lg-${serviceStartTime ? '12' : '7'}`}>
                {/* Batch Import Zone - Clicking the zone triggers upload, but buttons handle their own clicks */}
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={(e) => {
                        // Only trigger if clicking the zone itself, not children buttons
                        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                            document.getElementById('excel-upload').click();
                        }
                    }}
                    className="mb-4 p-5 text-center transition-all"
                    style={{ 
                        borderRadius: '24px',
                        border: `2px dashed ${isDragging ? PURPLE_AMETHYST : theme.colors.border}`,
                        background: isDragging ? `${PURPLE_AMETHYST}08` : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                        cursor: 'pointer'
                    }}
                >
                    <input 
                        type="file" 
                        id="excel-upload" 
                        hidden 
                        accept=".xlsx, .xls, .csv" 
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                                handleExcelImport(file);
                            } else {
                                const reader = new FileReader();
                                reader.onload = (re) => handleImport(re.target.result);
                                reader.readAsText(file);
                            }
                        }}
                    />
                    <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{ background: `${PURPLE_AMETHYST}15` }}>
                        <Upload size={32} color={PURPLE_AMETHYST} />
                    </div>
                    <h5 className="fw-bold mb-2">Importar Orden por Lote</h5>
                    <p className="text-muted small mb-4">Arrastra un archivo Excel (.xlsx) o .csv</p>
                    <div className="d-flex justify-content-center gap-3">
                        <button 
                            onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation(); 
                                downloadTemplate(); 
                            }} 
                            className="btn rounded-pill px-4 btn-sm fw-bold border-0 text-white" 
                            style={{ background: PURPLE_AMETHYST, position: 'relative', zIndex: 10 }}
                        >
                            <FileSpreadsheet size={16} className="me-2" /> Plantilla Excel
                        </button>
                        <button 
                            onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation(); 
                                setShowImport(!showImport); 
                            }} 
                            className="btn btn-outline-secondary rounded-pill px-4 btn-sm fw-bold"
                            style={{ position: 'relative', zIndex: 10 }}
                        >
                            Editor Rápido
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showImport && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-4">
                            <GlassCard>
                                <textarea 
                                    className="form-control mb-3 border-0 bg-light-soft" 
                                    rows="5" 
                                    placeholder="Actividad, Responsable, Hora, Duración (ej: Alabanza, Grupo, 10:00, 30)"
                                    value={importData}
                                    onChange={e => setImportData(e.target.value)}
                                />
                                <div className="d-flex justify-content-end gap-2">
                                    <button onClick={() => setShowImport(false)} className="btn btn-light rounded-pill px-4">Cancelar</button>
                                    <button onClick={() => handleImport()} className="btn btn-primary rounded-pill px-4" style={{ background: PURPLE_AMETHYST }}>Procesar Lote</button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <GlassCard style={{ borderRadius: '24px', padding: '0', overflow: 'hidden' }}>
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-3">
                            <h6 className="fw-bold mb-0">Vista Previa: <span style={{ color: PURPLE_AMETHYST }}>{selectedDate}</span></h6>
                        </div>
                        <div className="d-flex gap-2">
                             <button className="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold" onClick={exportCurrentOrden}>
                                <FileSpreadsheet size={14} className="me-2" /> Descargar Excel
                            </button>
                            {serviceStartTime ? (
                                <>
                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={stopService}>
                                        <X size={14} className="me-2" /> Detener
                                    </button>
                                    <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold" onClick={() => setIsPaused(!isPaused)}>
                                        {isPaused ? <Play size={14} fill="currentColor" className="me-2" /> : <Pause size={14} fill="currentColor" className="me-2" />}
                                        {isPaused ? 'Reiniciar' : 'Pausar'}
                                    </button>
                                    <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold" onClick={nextActivity}>
                                        <SkipForward size={14} className="me-2" /> Pasar
                                    </button>
                                </>
                            ) : (
                                <button className="btn btn-sm rounded-pill px-4 fw-bold text-white shadow-lg border-0" 
                                    onClick={startService}
                                    style={{ background: `linear-gradient(135deg, ${PURPLE_AMETHYST}, ${PURPLE_LIGHT})` }}
                                >
                                    <Play size={16} className="me-2" fill="currentColor" /> Iniciar Culto
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr className="x-small text-uppercase fw-bold" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)' }}>
                                    <th className="ps-4 py-3">Evento</th>
                                    <th>Responsable</th>
                                    <th>Duración</th>
                                    <th>Asistentes</th>
                                    <th className="text-end pe-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrden.map((item, idx) => (
                                    <tr key={item.id} className="border-bottom" style={{ color: isDark ? '#FFF' : '#000' }}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="p-2 rounded-3" style={{ background: `${PURPLE_AMETHYST}15` }}>
                                                    {idx === 0 ? <UsersIcon size={18} color={PURPLE_AMETHYST} /> : <FileSpreadsheet size={18} color={PURPLE_AMETHYST} />}
                                                </div>
                                                <div>
                                                    <div className="fw-bold small">{item.actividad}</div>
                                                    <div className="x-small" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{item.hora}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><div className="small fw-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.responsable}</div></td>
                                        <td style={{ width: '100px' }}>
                                            <div className="d-flex flex-column gap-1">
                                                <span className="x-small fw-bold">{item.duracionEstimada} min</span>
                                                <div className="progress" style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                                                    <div className="progress-bar" style={{ width: '100%', background: PURPLE_AMETHYST, opacity: 0.3 }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <UserPlus size={14} style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
                                                <span className="small fw-bold">{item.cantidadPersonas || 0}</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-1">
                                                <button className="btn btn-sm btn-light p-2 rounded-circle" onClick={() => moveActivity(idx, -1)} disabled={idx === 0}><ChevronUp size={14} /></button>
                                                <button className="btn btn-sm btn-light p-2 rounded-circle" onClick={() => moveActivity(idx, 1)} disabled={idx === filteredOrden.length - 1}><ChevronDown size={14} /></button>
                                                <button className="btn btn-sm btn-light text-danger p-2 rounded-circle ms-2" onClick={() => {
                                                    setConfirmConfig({
                                                        show: true, title: 'Eliminar Actividad', message: '¿Estás seguro?', type: 'danger',
                                                        onConfirm: async () => {
                                                            await apiClient.delete(`/orden-culto/${item.id}`);
                                                            fetchOrden();
                                                            setConfirmConfig(p => ({ ...p, show: false }));
                                                        }
                                                    });
                                                }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrden.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 small fw-bold" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                                            No hay actividades para esta fecha. Usa "Plantilla Excel" o agrega una manualmente.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
            
            {!showForm && (
                <div className="col-lg-5">
                    <div className="p-4 rounded-4 shadow-sm h-100" 
                        style={{ background: isDark ? 'linear-gradient(135deg, #1e1e2d, #14141f)' : 'linear-gradient(135deg, #ffffff, #f9f9ff)', border: `1px solid ${theme.colors.border}` }}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="fw-bold mb-0">Culto en Curso Preview (PWA)</h5>
                            <span className="badge rounded-pill bg-dark text-white x-small px-3">Modo Oscuro</span>
                        </div>
                        
                        <div className="mockup-phone-content p-4 rounded-4 bg-dark shadow-lg mx-auto" style={{ maxWidth: '300px', minHeight: '550px', border: '8px solid #222' }}>
                            <div className="text-center mb-5 mt-4">
                                <div className="p-2 rounded-circle d-inline-block mb-3" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                                    <Music size={24} color={PURPLE_LIGHT} strokeWidth={1} />
                                </div>
                                <h6 className="text-white fw-bold mb-1 opacity-50 x-small text-uppercase tracking-widest">Siguiente Acto</h6>
                                <h2 className="text-white fw-900" style={{ fontFamily: theme.fonts.accent, fontSize: '1.4rem' }}>{currentActivity?.actividad || 'Alabanza Inicial'}</h2>
                            </div>

                            <div className="position-relative d-flex justify-content-center mb-5">
                                <CircularProgress percentage={progressPercentage} size={220} />
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <div style={{ fontFamily: 'monospace', fontSize: '3rem', fontWeight: 900, color: PURPLE_LIGHT, lineHeight: 1 }}>
                                        {formatTime(Math.max((currentActivity?.duracionEstimada * 60) - elapsedSeconds, 0))}
                                    </div>
                                    <div className="x-small text-white opacity-40 fw-bold mt-2">RESTANTE</div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-center align-items-center gap-4 mt-5">
                                <button className="btn btn-outline-light rounded-circle p-3 border-0 bg-white-10" onClick={() => setCurrentActivityIndex(prev => Math.max(0, prev - 1))}><SkipForward size={24} className="transform rotate-180" /></button>
                                <button 
                                    onClick={togglePause}
                                    className="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center" 
                                    style={{ width: '64px', height: '64px' }}
                                >
                                    {isPaused ? <Play size={32} fill="black" /> : <Pause size={32} fill="black" />}
                                </button>
                                <button className="btn btn-outline-light rounded-circle p-3 border-0 bg-white-10" onClick={nextActivity}><SkipForward size={24} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderLiveServiceView = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="d-flex flex-column align-items-center py-4">
            <div className="w-100 mb-4 text-center">
                <button onClick={() => setViewMode('planning')} className="btn btn-sm btn-outline-secondary rounded-pill px-4 me-2">
                    <LayoutDashboard size={14} className="me-2" /> Volver a Gestión
                </button>
                <button onClick={stopService} className="btn btn-sm btn-outline-danger rounded-pill px-4">
                    <X size={14} className="me-2" /> Detener Culto
                </button>
            </div>

            <GlassCard style={{ maxWidth: '450px', width: '100%', padding: '40px', background: '#09090b', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '32px' }}>
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div className="rounded-circle animate-pulse" style={{ width: 8, height: 8, background: '#10B981' }}></div>
                        <span className="x-small fw-bold" style={{ color: '#10B981' }}>EN VIVO</span>
                    </div>
                    <h5 className="text-muted small fw-bold text-uppercase tracking-widest mb-1">{currentActivity?.responsable || 'A cargo'}</h5>
                    <h1 className="text-white fw-900" style={{ fontSize: '2.5rem', fontFamily: theme.fonts.accent }}>{currentActivity?.actividad || 'Sin actividad'}</h1>
                </div>

                <div className="position-relative d-flex justify-content-center mb-5 scale-lg">
                    <CircularProgress percentage={progressPercentage} size={280} />
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <div style={{ fontFamily: 'monospace', fontSize: '4.5rem', fontWeight: 900, color: progressPercentage > 80 ? PURPLE_LIGHT : SUCCESS_GREEN, lineHeight: 1 }}>
                            {formatTime(Math.max((currentActivity?.duracionEstimada * 60) - elapsedSeconds, 0))}
                        </div>
                        <div className="x-small text-white opacity-40 fw-bold mt-2 tracking-widest">MINUTOS RESTANTES</div>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-center gap-4">
                    <div className="text-center">
                        <button className="btn p-3 rounded-circle border-0 luxe-btn mb-2" onClick={() => setElapsedSeconds(prev => Math.max(prev - 30, 0))}><SkipForward size={24} className="transform rotate-180" color="white" /></button>
                        <div className="x-small text-white opacity-40 fw-bold">-30s</div>
                    </div>
                    <div className="text-center">
                        <button 
                            onClick={togglePause}
                            className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center luxe-play mb-2" 
                            style={{ width: '80px', height: '80px', background: '#fff' }}
                        >
                            {isPaused ? <Play size={40} fill="black" /> : <Pause size={40} fill="black" />}
                        </button>
                        <div className="x-small text-white opacity-40 fw-bold">{isPaused ? 'REANUDAR' : 'PAUSAR'}</div>
                    </div>
                    <div className="text-center">
                        <button className="btn p-3 rounded-circle border-0 luxe-btn mb-2" onClick={nextActivity}><SkipForward size={24} color="white" /></button>
                        <div className="x-small text-white opacity-40 fw-bold">PASAR</div>
                    </div>
                </div>

                <div className="mt-5 p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-0">
                        <div className="d-flex align-items-center gap-2">
                            <SkipForward size={14} color="#A78BFA" opacity={0.5} />
                            <span className="x-small text-muted fw-bold">SIGUIENTE:</span>
                        </div>
                        <span className="x-small text-white fw-bold">{filteredOrden[currentActivityIndex + 1]?.actividad || 'FIN DEL CULTO'}</span>
                    </div>
                </div>
            </GlassCard>
            
            <style>{`
                .luxe-btn { background: rgba(255,255,255,0.05); transition: all 0.2s; }
                .luxe-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
                .luxe-play { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .luxe-play:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(167, 139, 250, 0.4); }
                .tracking-widest { letter-spacing: 0.2em; }
                .fw-900 { font-weight: 900; }
                .bg-white-10 { background: rgba(255,255,255,0.05); }
                .scale-lg { transform: scale(1.1); }
            `}</style>
        </motion.div>
    );

    const renderMonthlyView = () => {
        const currentMonth = selectedDate.substring(0, 7);
        const monthData = monthlySummary[currentMonth] || {};
        
        return (
            <div className="row g-4 animate__animated animate__fadeIn">
                <div className="col-12">
                   <GlassCard style={{ padding: '30px' }}>
                      <div className="d-flex align-items-center gap-3 mb-4">
                         <div className="p-3 rounded-4" style={{ background: `${PURPLE_AMETHYST}15` }}>
                            <CalendarIcon size={24} color={PURPLE_AMETHYST} />
                         </div>
                         <div>
                            <h5 className="fw-bold mb-0" style={{ color: isDark ? '#FFF' : '#000' }}>Resumen Visual de Cultos ({currentMonth})</h5>
                            <p className="small mb-0" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Haz clic en un día para gestionar su programa</p>
                         </div>
                      </div>
                      
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-5 g-3">
                         {Object.keys(monthData).sort((a,b) => b.localeCompare(a)).map(date => (
                            <div key={date} className="col">
                               <div 
                                 onClick={() => { setSelectedDate(date); setViewMode('planning'); }}
                                 className="p-4 rounded-4 border text-center transition-all h-100 position-relative overflow-hidden" 
                                 style={{ 
                                    cursor: 'pointer', 
                                    background: date === selectedDate ? `${PURPLE_AMETHYST}10` : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                                    borderColor: date === selectedDate ? PURPLE_AMETHYST : theme.colors.border
                                 }}
                               >
                                  <div className="fw-bold mb-2">{new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                                  <div className="badge rounded-pill" style={{ background: PURPLE_AMETHYST }}>{monthData[date]} Actos</div>
                                  <div className="mt-3 x-small text-muted fw-bold text-uppercase">{new Date(date).toLocaleDateString(undefined, { weekday: 'long' })}</div>
                               </div>
                            </div>
                         ))}
                         {Object.keys(monthData).length === 0 && (
                            <div className="col-12 text-center py-5">
                                <Box size={48} color={theme.colors.border} className="mb-3 opacity-20" />
                                <div className="text-muted fw-bold">No hay cultos programados para este mes</div>
                            </div>
                         )}
                      </div>
                   </GlassCard>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid pb-5 px-md-5" style={{ color: theme.colors.text.primary, fontFamily: 'Inter, sans-serif' }}>
            {renderHeader()}
            
            <AnimatePresence mode="wait">
                {viewMode === 'live' && serviceStartTime ? (
                    <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderLiveServiceView()}
                    </motion.div>
                ) : viewMode === 'planning' ? (
                    <motion.div key="planning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderPlanningView()}
                    </motion.div>
                ) : (
                    <motion.div key="monthly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderMonthlyView()}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .x-small { font-size: 0.75rem; }
                .fw-600 { font-weight: 600; }
                .bg-light-soft { background: rgba(0,0,0,0.03); border-radius: 12px; }
                .bg-white-10 { background: rgba(255,255,255,0.08); }
                .border-white-10 { border: 1px solid rgba(255,255,255,0.15); }
                .fw-900 { font-weight: 900; }
            `}</style>

            <ConfirmationModal 
                show={confirmConfig.show}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(p => ({ ...p, show: false }))}
                style={{ backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.8)' }}
            />
        </div>
    );
};

export default AdminCulto;
