import React, { useEffect, useState } from 'react';
import { theme } from '../styles/theme';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import apiClient from '../../api/client';

const Live = () => {
    const [settings, setSettings] = useState({
        youtube_channel_id: '',
        youtube_live_video_id: '',
        stream_is_live: false,
        youtube_playlist_id: '',
        bg_image: '',
        overlay_opacity: 0.5
    });

    useEffect(() => {
        apiClient.get('/settings').then(({ data }) => {
            const settingsObj = Array.isArray(data) ?
                data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                data;
            setSettings(prev => ({ ...prev, ...settingsObj }));
        }).catch(err => console.error(err));
    }, []);

    const isLive = settings.stream_is_live == true || settings.stream_is_live == '1';
    let videoSrc = null;

    if (isLive && settings.youtube_live_video_id) {
        videoSrc = `https://www.youtube.com/embed/${settings.youtube_live_video_id}?autoplay=1&modestbranding=1&rel=0`;
    } else if (settings.youtube_playlist_id) {
        videoSrc = `https://www.youtube.com/embed?listType=playlist&list=${settings.youtube_playlist_id}&modestbranding=1&rel=0`;
    }

    // Dynamic Background Logic
    const hasCustomBg = !!settings.bg_image;
    const containerStyle = {
        animation: 'fadeIn 0.5s ease-in-out',
        minHeight: '100vh',
        margin: `-${theme.spacing(4)}`, // Counteract text container padding
        marginTop: '-20px',
        padding: theme.spacing(4),
        paddingTop: theme.spacing(10), // Add space for navbar
        color: 'white',
        borderRadius: '0',
        position: 'relative',
        overflow: 'hidden', // Ensure blur/overlay doesn't spill
        // Apply custom image if exists, else use default gradient
        ...(hasCustomBg ? {
            backgroundImage: `url(${settings.bg_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        } : {
            background: `
                radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 0.95), rgba(0, 0, 0, 1)),
                repeating-linear-gradient(45deg, rgba(124, 77, 255, 0.1) 0px, rgba(124, 77, 255, 0.1) 2px, transparent 2px, transparent 10px),
                linear-gradient(to bottom, #0a0a0f, #1a1a2e)
            `
        })
    };

    return (
        <div style={containerStyle}>
            {/* Custom Background Overlay */}
            {hasCustomBg && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: `rgba(0,0,0,${settings.overlay_opacity ?? 0.5})`,
                    zIndex: 0,
                    backdropFilter: 'blur(3px)' // Optional: slight blur for better text readability
                }}></div>
            )}

            {/* Content Wrapper */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <header style={{
                    textAlign: 'center',
                    marginBottom: theme.spacing(4),
                    padding: `0 ${theme.spacing(2)}`
                }}>
                    <h2 style={{
                        fontFamily: theme.fonts.logo,
                        fontSize: 'clamp(2rem, 6vw, 3rem)',
                        color: theme.colors.secondary, // Cyan for dark mode contrast
                        marginBottom: theme.spacing(2),
                        textShadow: `0 0 20px ${theme.colors.secondary}80`
                    }}>
                        Transmisión En Vivo
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                        Conéctate con nuestra comunidad en tiempo real.
                    </p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: theme.spacing(3),
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {/* Video Player Section */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{
                            padding: 0,
                            overflow: 'hidden',
                            aspectRatio: '16/9',
                            background: '#000',
                            borderRadius: theme.glass.borderRadius,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative'
                        }}>
                            {videoSrc ? (
                                <iframe
                                    src={videoSrc}
                                    title="Oasis Live Player"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    color: 'white'
                                }}>
                                    <div style={{
                                        width: '80px', height: '80px',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 0 20px rgba(255,255,255,0.1)',
                                        animation: 'pulse 2s infinite'
                                    }}>
                                        <i className="bi bi-play-fill" style={{ fontSize: '3rem', marginLeft: '5px' }}></i>
                                    </div>
                                    <p style={{ marginTop: theme.spacing(2), fontFamily: 'monospace', color: '#888' }}>ESPERANDO SEÑAL...</p>
                                </div>
                            )}

                            {/* Live Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '20px', left: '20px',
                                background: isLive ? 'rgba(220, 53, 69, 0.9)' : 'rgba(108, 117, 125, 0.8)',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                zIndex: 10
                            }}>
                                <span style={{
                                    width: '8px', height: '8px',
                                    background: 'white', borderRadius: '50%',
                                    animation: isLive ? 'blink 1s infinite' : 'none'
                                }}></span>
                                {isLive ? 'EN VIVO' : 'OFFLINE'}
                            </div>
                        </div>


                        <div style={{ marginTop: theme.spacing(3), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'white' }}>Servicio Dominical</h3>
                                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>Inicia a las 10:00 AM</p>
                            </div>
                            <div style={{ display: 'flex', gap: theme.spacing(2) }}>
                                <Button variant="primary"><i className="bi bi-share"></i> Compartir</Button>
                                <Button variant="outline"><i className="bi bi-bell"></i> Recordarme</Button>
                            </div>
                        </div>
                    </div>

                    {/* Chat / Schedule Section */}
                    <div>
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: theme.glass.background,
                            border: theme.glass.border,
                            borderRadius: theme.glass.borderRadius,
                            padding: theme.spacing(4),
                            backdropFilter: theme.glass.backdropFilter,
                            WebkitBackdropFilter: theme.glass.backdropFilter,
                            boxShadow: theme.glass.boxShadow
                        }}>
                            <h3 style={{ borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: theme.spacing(2), marginBottom: theme.spacing(2), color: 'white' }}>
                                Próximos Eventos
                            </h3>
                            <div style={{ flex: 1 }}>
                                <EventItem day="Hoy" time="7:00 PM" title="Estudio Bíblico" />
                                <EventItem day="Viernes" time="8:00 PM" title="Noche de Jóvenes" />
                                <EventItem day="Domingo" time="10:00 AM" title="Servicio General" />
                            </div>
                            <div style={{ marginTop: theme.spacing(4) }}>
                                <Button variant="secondary" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
                                    Ver Calendario Completo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                }
            `}</style>
            </div> {/* End Content Wrapper */}
        </div >
    );
};

const EventItem = ({ day, time, title }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.05)'
    }}>
        <div style={{
            background: theme.colors.primary,
            color: 'white',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            textAlign: 'center',
            minWidth: '60px'
        }}>
            <div style={{ fontWeight: 'bold' }}>{day}</div>
            <div>{time}</div>
        </div>
        <div style={{ fontWeight: '500', color: '#e0e0e0' }}>
            {title}
        </div>
    </div>
);

export default Live;
