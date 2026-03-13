import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../react-ui/ThemeContext';
import GlassCard from '../react-ui/components/GlassCard';
import { 
    Users, 
    HeartHandshake, 
    Calendar, 
    TrendingUp, 
    Bell, 
    MoreVertical, 
    Plus,
    Clock,
    UserCheck,
    Coins,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Inbox,
    MonitorPlay,
    Newspaper,
    Settings,
    LayoutDashboard,
    Image,
    FileText,
    Activity,
    Database,
    ArrowRight,
    Search,
    Download,
    Users2,
    Info as InfoIcon
} from 'lucide-react';
import apiClient from '../api/client';

const Dashboard = () => {
    const { theme, mode } = useTheme();
    const { role } = useAuth();
    const isDark = mode === 'dark';
    const navigate = useNavigate();

    const PURPLE_AMETHYST = '#6D28D9';
    const PURPLE_LIGHT = '#A78BFA';
    
    // Stats State
    const [stats, setStats] = useState({ 
        totalRequests: 0, 
        pendingRequests: 0,
        activeAnnouncements: 0,
        totalResources: 0,
        nextEvent: null,
        activeBillboards: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentLiveActivity, setCurrentLiveActivity] = useState(null);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [liveSettings, setLiveSettings] = useState(null);
    const [ordenCulto, setOrdenCulto] = useState([]);

    // Mock Chart Data
    const attendanceData = [45, 62, 58, 85, 92, 78, 95];
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [reqsRes, announcementsRes, resourcesRes, cultoRes, billboardRes, settingsRes] = await Promise.all([
                    apiClient.get('/requests').catch(() => ({ data: [] })),
                    apiClient.get('/announcements').catch(() => ({ data: [] })),
                    apiClient.get('/gallery-items').catch(() => ({ data: [] })),
                    apiClient.get('/orden-culto').catch(() => ({ data: [] })),
                    apiClient.get('/admin/billboards').catch(() => ({ data: [] })),
                    apiClient.get('/public/settings').catch(() => ({ data: {} }))
                ]);

                setOrdenCulto(cultoRes.data.sort((a, b) => a.hora.localeCompare(b.hora)));
                setLiveSettings(settingsRes.data);

                setStats({
                    totalRequests: reqsRes.data.length,
                    pendingRequests: reqsRes.data.filter(r => r.status === 'pendiente').length,
                    activeAnnouncements: announcementsRes.data.filter(a => a.isPublished).length,
                    totalResources: resourcesRes.data.length,
                    nextEvent: cultoRes.data.find(item => !item.completado),
                    activeBillboards: billboardRes.data.filter(b => b.is_active).length
                });

                setRecentRequests(reqsRes.data.slice(0, 5));
            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            } finally {
                setLoading(false);
            }
        };

        const fetchPollingData = async () => {
            try {
                const { data } = await apiClient.get('/public/settings');
                setLiveSettings(data);
            } catch (e) { console.error('Poll error:', e); }
        };

        fetchDashboardData();

        const timer = setInterval(() => {
            setSecondsRemaining(prev => Math.max(prev - 1, 0));
        }, 1000);

        const poll = setInterval(fetchPollingData, 10000);

        return () => {
            clearInterval(timer);
            clearInterval(poll);
        };
    }, []);

    // Sincronizar Actividad en Vivo y Tiempo desde Settings
    useEffect(() => {
        if (!liveSettings || !ordenCulto.length) return;

        const isStreamLive = liveSettings.stream_is_live === 'true' || liveSettings.stream_is_live === true;
        
        if (isStreamLive && liveSettings.current_activity_id) {
            const active = ordenCulto.find(item => item.id.toString() === liveSettings.current_activity_id.toString());
            if (active) {
                setCurrentLiveActivity(active);
                
                // Calcular tiempo restante basado en servidor
                if (liveSettings.activity_start_time) {
                    const serverStart = new Date(liveSettings.activity_start_time).getTime();
                    const totalSecs = active.duracionEstimada * 60;
                    const isPaused = liveSettings.is_paused === 'true';

                    if (isPaused) {
                        setSecondsRemaining(totalSecs - parseInt(liveSettings.paused_at_seconds || '0'));
                    } else {
                        const elapsed = Math.floor((Date.now() - serverStart) / 1000);
                        setSecondsRemaining(Math.max(0, totalSecs - elapsed));
                    }
                } else {
                    setSecondsRemaining(active.duracionEstimada * 60);
                }
                return;
            }
        }
        
        // Fallback a Próximo Evento si no hay Live activo
        if (stats.nextEvent) {
            setCurrentLiveActivity(stats.nextEvent);
            setSecondsRemaining(0); // O mostrar tiempo hasta que inicie
        }
    }, [liveSettings, ordenCulto, stats.nextEvent]);

    const ModuleCard = ({ icon: Icon, title, info, link, color = PURPLE_AMETHYST }) => (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="h-100"
            onClick={() => navigate(link)}
            style={{ cursor: 'pointer' }}
        >
            <GlassCard style={{ padding: '24px', position: 'relative', overflow: 'hidden', height: '100%', borderRadius: '24px' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ 
                        padding: '12px', 
                        borderRadius: '16px', 
                        background: `${color}15`,
                        color: color
                    }}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="fw-900 mb-0" style={{ fontSize: '0.9rem', color: theme.colors.text.primary }}>{title}</h6>
                        <span className="x-small text-muted fw-bold">{info}</span>
                    </div>
                    <ArrowRight size={16} className="text-muted opacity-50" />
                </div>
                
                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                    <Icon size={90} color={color} />
                </div>
            </GlassCard>
        </motion.div>
    );

    const StatHighlight = ({ label, value, icon: Icon, color }) => (
        <div className="d-flex align-items-center gap-3 px-3 py-2 rounded-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${theme.colors.border}`, minWidth: '160px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: `${color}15` }}>
                <Icon size={18} color={color} />
            </div>
            <div>
                <div className="fw-900" style={{ fontSize: '1.2rem', lineHeight: 1 }}>{value}</div>
                <div className="x-small text-muted fw-bold text-uppercase tracking-wider" style={{ fontSize: '0.6rem' }}>{label}</div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid pb-5" style={{ color: theme.colors.text.primary, fontFamily: 'Inter, sans-serif' }}>
            
            {/* Header / Search */}
            <header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-4 p-4 rounded-4" 
                style={{ 
                    background: theme.glass.background,
                    backdropFilter: theme.glass.backdropFilter,
                    border: theme.glass.border,
                    borderRadius: '28px',
                    boxShadow: theme.shadows.soft
                }}>
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-0.5px', marginBottom: '4px', fontFamily: theme.fonts.accent, textTransform: 'uppercase' }}>
                        PORTAL <span style={{ color: PURPLE_AMETHYST }}>PASTORAL</span>
                    </h1>
                    <div className="d-flex align-items-center gap-2">
                        <Activity size={16} className="text-success animate-pulse" />
                        <p className="text-muted small fw-600 mb-0">Ecosistema Oasis | Panel de Inteligencia v2.0</p>
                    </div>
                </div>

                <div className="d-flex gap-2 w-100 w-md-auto">
                    <div className="flex-grow-1 position-relative" style={{ minWidth: '250px' }}>
                        <Search className="position-absolute translate-middle-y top-50 ms-3 opacity-25" size={18} />
                        <input 
                            type="text" 
                            className="form-control rounded-pill ps-5 border-0" 
                            placeholder="Buscar reporte o función..." 
                            style={{ height: '52px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', fontWeight: 600 }}
                        />
                    </div>
                    <button onClick={() => navigate('/admin/ajustes')} className="btn rounded-circle d-flex align-items-center justify-content-center border-0" style={{ width: 52, height: 52, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Quick Stats Highlights */}
            <div className="d-flex flex-wrap gap-3 mb-5">
                <StatHighlight label="Peticiones" value={stats.pendingRequests} icon={Inbox} color="#F59E0B" />
                <StatHighlight label="Oasis Press" value={stats.activeAnnouncements} icon={Newspaper} color="#10B981" />
                <StatHighlight label="Impacto Media" value={stats.totalResources} icon={Database} color={PURPLE_AMETHYST} />
                <StatHighlight label="Admin Online" value="3" icon={UserCheck} color="#3B82F6" />
                
                {stats.nextEvent && (
                    <motion.div 
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        className="ms-md-auto px-4 py-2 rounded-pill d-flex align-items-center gap-3 shadow-lg text-white" 
                        style={{ background: `linear-gradient(135deg, ${PURPLE_AMETHYST}, #4F46E5)`, cursor: 'pointer' }}
                        onClick={() => navigate('/admin/culto')}
                    >
                        <Clock size={18} />
                        <div>
                            <span className="x-small fw-bold text-uppercase opacity-75 d-block">PROX: {stats.nextEvent.actividad}</span>
                            <span className="fw-900 small">{stats.nextEvent.hora}</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Main Content Areas */}
            <div className="row g-4 mb-5">
                <div className="col-lg-8">
                    <GlassCard style={{ height: '420px', padding: '32px', borderRadius: '32px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h4 className="fw-900 mb-1">Alcance Communitario</h4>
                                <p className="text-muted small fw-bold">Interacciones y asistencia proyectada</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-xs rounded-pill px-3 py-1 bg-light-soft fw-bold small"><Download size={12} className="me-1" /> PDF</button>
                                <select className="form-select-sm border-0 bg-light-soft rounded-pill px-3 fw-bold">
                                    <option>Ultimos 7 días</option>
                                    <option>Este Mes</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ flex: 1, position: 'relative', height: '220px' }}>
                             <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={PURPLE_AMETHYST} stopOpacity="0.4" />
                                        <stop offset="100%" stopColor={PURPLE_AMETHYST} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={`M 0 200 ${attendanceData.map((v, i) => `L ${i * 133} ${200 - (v * 1.8)}`).join(' ')} L 800 200 Z`} fill="url(#chartGrad)" />
                                <motion.path 
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                                    d={`M 0 200 ${attendanceData.map((v, i) => `L ${i * 133} ${200 - (v * 1.8)}`).join(' ')}`} 
                                    fill="none" stroke={PURPLE_AMETHYST} strokeWidth="5" strokeLinecap="round"
                                />
                                {attendanceData.map((v, i) => (
                                    <circle key={i} cx={i * 133} cy={200 - (v * 1.8)} r="6" fill="#fff" stroke={PURPLE_AMETHYST} strokeWidth="3" />
                                ))}
                            </svg>
                            <div className="d-flex justify-content-between mt-4 px-2">
                                {days.map(d => <span key={d} className="x-small text-muted fw-900">{d}</span>)}
                            </div>
                        </div>
                    </GlassCard>
                </div>                <div className="col-lg-4">
                    <GlassCard style={{ height: '420px', padding: '32px', borderRadius: '32px', background: isDark ? 'rgba(109, 40, 217, 0.05)' : 'rgba(109, 40, 217, 0.02)', border: `1px solid ${PURPLE_AMETHYST}33` }}>
                        <div className="d-flex justify-content-between align-items-start mb-5">
                            <div>
                                <h4 className="fw-900 mb-1">Culto en Curso</h4>
                                <p className="text-muted small fw-bold">Sincronización en tiempo real</p>
                            </div>
                            <div className="px-3 py-1 rounded-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <span className="x-small fw-900 text-danger animate-pulse">LIVE</span>
                            </div>
                        </div>
                        
                        <div className="text-center mb-4">
                            <h5 className="text-muted small fw-bold text-uppercase tracking-widest mb-1">{currentLiveActivity?.responsable || 'Iniciando...'}</h5>
                            <h2 className="fw-900 mb-3" style={{ fontSize: '2rem', color: theme.colors.text.primary }}>{currentLiveActivity?.actividad || 'Sin actividad activa'}</h2>
                            
                            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                                <div className="text-center">
                                    <div className="fw-900" style={{ fontSize: '3.5rem', fontFamily: 'monospace', color: secondsRemaining < 60 ? '#EF4444' : PURPLE_AMETHYST, lineHeight: 1 }}>
                                        {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:{ (secondsRemaining % 60).toString().padStart(2, '0') }
                                    </div>
                                    <div className="x-small text-muted fw-bold mt-2">TIEMPO RESTANTE</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="progress rounded-pill shadow-inner" style={{ height: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                <motion.div 
                                    initial={{ width: '100%' }} 
                                    animate={{ width: currentLiveActivity ? `${(secondsRemaining / (currentLiveActivity.duracionEstimada * 60)) * 100}%` : '0%' }} 
                                    className="progress-bar rounded-pill" 
                                    style={{ background: secondsRemaining < 60 ? '#EF4444' : PURPLE_AMETHYST }} 
                                />
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/admin/culto')}
                            className="btn btn-outline-primary w-100 rounded-pill fw-bold py-3 mt-2" 
                            style={{ borderColor: PURPLE_AMETHYST, color: PURPLE_AMETHYST, background: 'transparent' }}
                        >
                            Control de Plataforma
                        </button>
                    </GlassCard>
                </div>
            </div>

            {/* Ecosystem Hub Grid */}
            <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                <h4 className="fw-900 mb-0">Ecosistema <span className="text-muted">Global</span></h4>
            </div>
            
            <div className="row g-4 mb-5">
                {[
                    { title: 'Oasis Press', info: `${stats.activeAnnouncements} Publicados`, icon: Newspaper, link: '/admin/announcements', color: '#10B981' },
                    { title: 'Orden de Culto', info: 'Sincronización en vivo', icon: Calendar, link: '/admin/culto', color: PURPLE_AMETHYST },
                    { title: 'Peticiones', info: `${stats.pendingRequests} Pendientes`, icon: Inbox, link: '/admin/requests', color: '#F59E0B' },
                    { title: 'Formularios & Eventos', info: 'Captación de datos', icon: FileText, link: '/admin/inscripciones', color: '#3B82F6' },
                    { title: 'Cartelera Hero', info: `${stats.activeBillboards} Activos`, icon: Image, link: '/admin/cartelera', color: '#8B5CF6' },
                    { title: 'Live Streaming', info: 'Ready for YouTube/FB', icon: MonitorPlay, link: '/admin/live', color: '#EF4444' },
                    { title: 'Media & Recursos', info: `${stats.totalResources} Archivos`, icon: Database, link: '/admin/recursos', color: '#6366F1' },
                    { title: 'Equipo & Roles', info: 'Gestión de voluntarios', icon: Users2, link: '/admin/users', color: '#EC4899', adminOnly: true },
                    { title: 'Identidad (About)', info: 'Textos institucionales', icon: InfoIcon, link: '/admin/about', color: '#22D3EE' },
                    { title: 'Configuración', info: 'SMTP / WhatsApp / API', icon: Settings, link: '/admin/ajustes', color: '#6B7280', adminOnly: true },
                ].filter(m => !m.adminOnly || role === 'admin').map((module, i) => (
                    <div key={i} className="col-6 col-md-4 col-xl-2-4">
                        <ModuleCard {...module} />
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <GlassCard style={{ padding: '32px', borderRadius: '32px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-900 mb-0">Actividad Reciente</h4>
                            <Link to="/admin/requests" className="small text-decoration-none fw-bold" style={{ color: PURPLE_AMETHYST }}>Gestionar todo <ArrowRight size={14} /></Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table" style={{ color: 'inherit' }}>
                                <tbody>
                                    {recentRequests.map((req, i) => (
                                        <tr key={i} className="align-middle border-bottom border-light-soft">
                                            <td className="py-3 px-0">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-900 text-white" 
                                                        style={{ width: 38, height: 38, background: i % 2 === 0 ? PURPLE_AMETHYST : PURPLE_LIGHT, fontSize: '0.8rem' }}>
                                                        {req.isAnonymous ? '?' : (req.name || 'U')[0]}
                                                    </div>
                                                    <div>
                                                        <div className="small fw-800">{req.isAnonymous ? 'Anónimo' : req.name}</div>
                                                        <div className="x-small text-muted fw-600">{req.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="x-small fw-bold opacity-75 text-truncate" style={{ maxWidth: '280px' }}>{req.description}</div>
                                            </td>
                                            <td className="py-3 text-end">
                                                <div className="x-small text-muted fw-900">{new Date(req.createdAt).toLocaleDateString()}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
                
                <div className="col-lg-4">
                   <GlassCard style={{ padding: '32px', borderRadius: '32px' }}>
                        <h4 className="fw-900 mb-4">Salud del Sistema</h4>
                        <div className="d-flex flex-column gap-3">
                            {[
                                { title: 'Servidor de Correo', desc: 'En línea', icon: CheckCircle2, color: '#10B981' },
                                { title: 'Base de Datos', desc: 'Sincronizada', icon: Database, color: '#3B82F6' },
                                { title: 'Evolution API', desc: 'Conectada (WhatsApp)', icon: Activity, color: '#10B981' }
                            ].map((s, i) => (
                                <div key={i} className="d-flex align-items-center gap-3 p-3 rounded-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                    <div className="p-2 rounded-3" style={{ background: `${s.color}15`, color: s.color }}>
                                        <s.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="small fw-800 mb-0">{s.title}</div>
                                        <div className="x-small text-muted fw-bold">{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                   </GlassCard>
                </div>
            </div>

            <style>{`
                .fw-900 { font-weight: 900; }
                .fw-800 { font-weight: 800; }
                .fw-600 { font-weight: 600; }
                .x-small { font-size: 0.7rem; }
                .bg-light-soft { background: rgba(0,0,0,0.03); }
                .tracking-wider { letter-spacing: 1px; }
                .col-xl-2-4 { flex: 0 0 20%; max-width: 20%; }
                @media (max-width: 1200px) { .col-xl-2-4 { flex: 0 0 33.333%; max-width: 33.333%; } }
                @media (max-width: 768px) { .col-xl-2-4 { flex: 0 0 50%; max-width: 50%; } }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            `}</style>
        </div>
    );
};

export default Dashboard;
