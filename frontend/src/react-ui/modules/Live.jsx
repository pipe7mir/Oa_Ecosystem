import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import apiClient from '../../api/client';
import useAppMode from '../../hooks/useAppMode';
import { useToast } from '../components/Toast';

const Live = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { isMobile } = useAppMode();
    const { showToast } = useToast();
    const [settings, setSettings] = useState({
        youtube_channel_id: '',
        youtube_live_video_id: '',
        stream_is_live: false,
        youtube_playlist_id: '',
        bg_image: '',
        overlay_opacity: 0.5,
        live_service_title: 'Servicio de Adoración',
        live_service_description: 'Transmitiendo ahora para todo el mundo'
    });

    const [ordenCulto, setOrdenCulto] = useState([]);
    const [currentMoment, setCurrentMoment] = useState(null);
    const [nextMoment, setNextMoment] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [stats, setStats] = useState({ onlineUsers: 0 });

    useEffect(() => {
        // Generate unique session ID if not exists
        let sessionId = localStorage.getItem('oasis_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('oasis_session_id', sessionId);
        }

        const fetchData = async () => {
            try {
                const { data } = await apiClient.get('/public/settings');
                setSettings(prev => ({ ...prev, ...data }));

                const { data: statsData } = await apiClient.get('/public/stats');
                setStats(statsData);
            } catch (err) { console.error(err); }
        };

        const fetchOrden = async () => {
            try {
                const { data } = await apiClient.get('/public/orden-culto');
                setOrdenCulto(data || []);
            } catch (e) { console.error('Error fetching orden culto:', e); }
        };

        const sendHeartbeat = () => {
            apiClient.post('/public/heartbeat', { id: sessionId }).catch(() => {});
        };

        fetchData();
        fetchOrden();
        sendHeartbeat();

        const dataInterval = setInterval(fetchData, 5000);
        const heartbeatInterval = setInterval(sendHeartbeat, 30000);
        const ordenInterval = setInterval(fetchOrden, 5000);

        return () => {
            clearInterval(dataInterval);
            clearInterval(heartbeatInterval);
            clearInterval(ordenInterval);
        };
    }, []);

    useEffect(() => {
        if (!ordenCulto.length) return;

        const updateMoments = () => {
            const now = new Date();
            const currentTimeStr = now.toLocaleTimeString('en-GB', { hour12: false });
            const [nowH, nowM, nowS] = currentTimeStr.split(':').map(Number);
            const nowSeconds = nowH * 3600 + nowM * 60 + nowS;

            let current = null;
            let next = null;

            // PRIORIDAD 1: Sincronización Manual (Admin)
            // Fix: 'false' string is truthy in JS, so we need a specific check
            const isLiveStatus = settings.stream_is_live === true || 
                                settings.stream_is_live === 'true' || 
                                settings.stream_is_live === '1' || 
                                settings.stream_is_live === 1;

            if (settings.current_activity_id && isLiveStatus) {
                current = ordenCulto.find(item => item.id.toString() === settings.current_activity_id.toString());
                if (current) {
                    const idx = ordenCulto.indexOf(current);
                    next = ordenCulto[idx + 1] || null;
                    
                    // Sincronización del tiempo basada en el servidor
                    if (settings.activity_start_time) {
                        const startTime = new Date(settings.activity_start_time).getTime();
                        const totalDurationSeconds = current.duracionEstimada * 60;
                        const isPaused = settings.is_paused === 'true';

                        let elapsed;
                        if (isPaused) {
                            elapsed = parseInt(settings.paused_at_seconds || '0');
                        } else {
                            elapsed = Math.floor((Date.now() - startTime) / 1000);
                        }

                        const remaining = Math.max(0, totalDurationSeconds - elapsed);
                        const remM = Math.floor(remaining / 60);
                        const remS = remaining % 60;
                        setTimeLeft(`${remM}:${remS.toString().padStart(2, '0')}`);
                    } else {
                        setTimeLeft('LIVE'); // Fallback si no hay tiempo
                    }
                }
            }

            // PRIORIDAD 2: Cálculo automático basado en reloj (Fallback)
            if (!current) {
                for (let i = 0; i < ordenCulto.length; i++) {
                    const item = ordenCulto[i];
                    const [h, m] = item.hora.split(':').map(Number);
                    const itemStartSeconds = h * 3600 + m * 60;
                    const itemEndSeconds = itemStartSeconds + (item.duracionEstimada * 60);

                    if (nowSeconds >= itemStartSeconds && nowSeconds < itemEndSeconds) {
                        current = item;
                        next = ordenCulto[i + 1] || null;
                        
                        const remaining = itemEndSeconds - nowSeconds;
                        const remM = Math.floor(remaining / 60);
                        const remS = remaining % 60;
                        setTimeLeft(`${remM}:${remS.toString().padStart(2, '0')}`);
                        break;
                    } else if (nowSeconds < itemStartSeconds) {
                        if (!next) next = item;
                    }
                }
            }

            setCurrentMoment(current);
            setNextMoment(next);
            if (!current) setTimeLeft('');
        };

        updateMoments();
        const interval = setInterval(updateMoments, 1000);
        return () => clearInterval(interval);
    }, [ordenCulto, settings]);

    const handleShare = async () => {
        const shareData = {
            title: `Oasis Live: ${settings.live_service_title}`,
            text: settings.live_service_description,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) { console.log('Share failed', err); }
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast('Enlace copiado al portapapeles', 'info');
        }
    };

    const handlePrayerRequest = () => {
        navigate('/peticiones');
    };

    const isLive = settings.stream_is_live == true || settings.stream_is_live == '1';
    let videoSrc = null;

    if (isLive && settings.youtube_live_video_id) {
        videoSrc = `https://www.youtube.com/embed/${settings.youtube_live_video_id}?autoplay=1&modestbranding=1&rel=0`;
    } else if (settings.youtube_playlist_id) {
        videoSrc = `https://www.youtube.com/embed?listType=playlist&list=${settings.youtube_playlist_id}&modestbranding=1&rel=0`;
    }

    const hasCustomBg = !!settings.bg_image;
    const containerStyle = {
        animation: 'fadeIn 0.5s ease-in-out',
        minHeight: '100vh',
        margin: `-${theme.spacing(4)}`,
        marginTop: '-20px',
        padding: theme.spacing(4),
        paddingTop: isMobile ? theme.spacing(10) : theme.spacing(4),
        color: 'white',
        borderRadius: '0',
        position: 'relative',
        overflow: 'hidden',
        ...(hasCustomBg ? {
            backgroundImage: `url(${settings.bg_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        } : {
            background: `radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 0.95), rgba(0, 0, 0, 1)), linear-gradient(to bottom, #0a0a0f, #1a1a2e)`
        })
    };

    return (
        <div style={containerStyle}>
            {hasCustomBg && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: `rgba(0,0,0,${settings.overlay_opacity ?? 0.5})`,
                    zIndex: 0,
                    backdropFilter: 'blur(3px)'
                }}></div>
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                <header style={{ textAlign: 'center', marginBottom: theme.spacing(4), padding: `0 ${theme.spacing(2)}` }}>
                    <h2 style={{ fontFamily: theme.fonts.logo, fontSize: 'clamp(2rem, 6vw, 3rem)', color: '#fff', marginBottom: theme.spacing(2), textShadow: `0 0 20px rgba(255,255,255,0.4)` }}>
                        Transmisión En Vivo
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                        Conéctate con nuestra comunidad en tiempo real.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: theme.spacing(3), maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                        <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: theme.glass.borderRadius, boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                            {videoSrc ? (
                                <iframe src={videoSrc} title="Oasis Live Player" width="100%" height="100%" style={{ border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
                                        <i className="bi bi-play-fill" style={{ fontSize: '3rem', marginLeft: '5px' }}></i>
                                    </div>
                                    <p style={{ marginTop: theme.spacing(2), fontFamily: 'monospace', color: '#888' }}>ESPERANDO SEÑAL...</p>
                                </div>
                            )}
                            
                            {/* Stats & Status Overlay */}
                            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px' }}>
                                <div style={{ background: isLive ? 'rgba(220, 53, 69, 0.9)' : 'rgba(108, 117, 125, 0.8)', color: 'white', padding: '5px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
                                    <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: isLive ? 'blink 1s infinite' : 'none' }}></span>
                                    {isLive ? 'EN VIVO' : 'OFFLINE'}
                                </div>
                                <div style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)', color: 'white', padding: '5px 12px', borderRadius: '50px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <i className="bi bi-people-fill text-primary"></i>
                                    {stats.onlineUsers} <span style={{ opacity: 0.7 }}>conectados</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: theme.spacing(3), display: 'flex', flexWrap: 'wrap', gap: theme.spacing(3), justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{settings.live_service_title}</h3>
                                <p style={{ margin: '5px 0 0 0', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.4 }}>{settings.live_service_description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: theme.spacing(2) }}>
                                <Button 
                                    onClick={handleShare}
                                    variant="primary" 
                                    style={{ background: theme.colors.primary, color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontSize: '1rem' }}
                                >
                                    <i className="bi bi-share-fill me-2"></i> Compartir
                                </Button>
                                <Button 
                                    onClick={handlePrayerRequest}
                                    variant="outline" 
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff', padding: '12px 24px', borderRadius: '14px', fontSize: '1rem', backdropFilter: 'blur(5px)' }}
                                >
                                    <i className="bi bi-heart-fill me-2 text-danger"></i> Pedir Oración
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            background: 'rgba(15, 15, 25, 0.7)', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px', 
                            padding: theme.spacing(4), 
                            backdropFilter: 'blur(20px)', 
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)' 
                        }}>
                            <h3 style={{ 
                                borderBottom: `2px solid ${theme.colors.primary}40`, 
                                paddingBottom: theme.spacing(2), 
                                marginBottom: theme.spacing(4), 
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                letterSpacing: '-0.5px'
                            }}>
                                <i className="bi bi-list-stars me-2 text-primary"></i> Orden de Culto
                            </h3>
                            
                            <div style={{ marginBottom: theme.spacing(4) }}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="pulse-dot"></span>
                                    <small className="text-uppercase letter-spacing-1 fw-bold" style={{ color: theme.colors.primary }}>Ahora</small>
                                </div>
                                <div style={{ 
                                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`, 
                                    padding: '24px', 
                                    borderRadius: '20px', 
                                    boxShadow: `0 10px 30px ${theme.colors.primary}40`,
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: '800', lineHeight: 1.2 }}>
                                            {currentMoment?.actividad || (ordenCulto.length > 0 ? 'Interludio' : 'Bienvenida')}
                                        </h4>
                                        <div style={{ 
                                            fontFamily: 'monospace', 
                                            background: 'rgba(0,0,0,0.4)', 
                                            padding: '6px 12px', 
                                            borderRadius: '8px', 
                                            color: '#00ffd5',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            border: '1px solid rgba(0,255,213,0.3)'
                                        }}>
                                            {timeLeft || 'LIVE'}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        marginTop: '15px', 
                                        paddingTop: '15px', 
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-person text-white"></i>
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                                            {currentMoment?.responsable || 'Equipo Oasis'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: theme.spacing(4) }}>
                                <small className="text-uppercase letter-spacing-1 fw-bold d-block mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Siguiente</small>
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    padding: '15px 20px', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h5 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                                            {nextMoment?.actividad || 'Cierre de Servicio'}
                                        </h5>
                                        <p className="small mb-0 mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            Inicia a las {nextMoment?.hora.substring(0, 5) || '--:--'}
                                        </p>
                                    </div>
                                    <i className="bi bi-arrow-right-short fs-4 text-white opacity-25"></i>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                                <small className="text-uppercase letter-spacing-1 fw-bold d-block mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Programa Completo</small>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {ordenCulto.map((item, idx) => {
                                        const isCurrent = currentMoment?.id === item.id;
                                        return (
                                            <div key={idx} style={{ 
                                                display: 'flex', 
                                                gap: '15px', 
                                                padding: '10px',
                                                borderRadius: '12px',
                                                background: isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                opacity: isCurrent ? 1 : 0.4,
                                                transition: 'all 0.3s'
                                            }}>
                                                <span style={{ 
                                                    minWidth: '55px', 
                                                    fontSize: '0.85rem', 
                                                    color: isCurrent ? theme.colors.primary : '#fff',
                                                    fontWeight: '700'
                                                }}>
                                                    {item.hora.substring(0, 5)}
                                                </span>
                                                <span style={{ 
                                                    fontSize: '0.95rem', 
                                                    color: '#fff',
                                                    fontWeight: isCurrent ? '600' : '400'
                                                }}>
                                                    {item.actividad}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
                .letter-spacing-1 { letter-spacing: 1px; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .pulse-dot { width: 10px; height: 10px; background: #00ffd5; border-radius: 50%; box-shadow: 0 0 10px #00ffd5; animation: blink 1s infinite; }
            `}</style>
            </div>
        </div>
    );
};

export default Live;
