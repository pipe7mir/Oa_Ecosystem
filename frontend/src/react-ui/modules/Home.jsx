import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Hero from '../components/Hero';
import Announcements from '../components/Announcements';
import MapSection from '../components/MapSection';
import CalendarSection from '../components/CalendarSection';
import apiClient from '../../api/client';

const Home = () => {
    const [settings, setSettings] = useState({
        youtube_channel_id: '',
        youtube_live_video_id: '',
        stream_is_live: false,
        youtube_playlist_id: ''
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
        // Option: Show playlist on home if configured, or maybe just Live?
        // Let's show it if configured, as a "Featured Content" area
        videoSrc = `https://www.youtube.com/embed?listType=playlist&list=${settings.youtube_playlist_id}&modestbranding=1&rel=0`;
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            {/* Hero Section */}
            <Hero />

            {/* Live Stream / Featured Video Section */}
            {videoSrc && (
                <section style={{ maxWidth: '1000px', margin: '0 auto', marginTop: `-${theme.spacing(4)}`, marginBottom: theme.spacing(4), position: 'relative', zIndex: 10, padding: `0 ${theme.spacing(2)}` }}>
                    <div style={{
                        borderRadius: theme.glass.borderRadius,
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: '#000',
                        position: 'relative'
                    }}>
                        <div style={{ aspectRatio: '16/9' }}>
                            <iframe
                                src={videoSrc}
                                title="Featured Player"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        {isLive && (
                            <div style={{
                                position: 'absolute',
                                top: '15px', left: '15px',
                                background: 'rgba(220, 53, 69, 0.9)',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                pointerEvents: 'none'
                            }}>
                                <span style={{
                                    width: '8px', height: '8px',
                                    background: 'white', borderRadius: '50%',
                                    animation: 'blink 1s infinite'
                                }}></span>
                                EN VIVO
                            </div>
                        )}
                        <style>{`
                            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                        `}</style>
                    </div>
                </section>
            )}

            {/* Announcements Module */}
            <Announcements />

            {/* Feature Grid */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: theme.spacing(4),
                marginTop: theme.spacing(4)
            }}>
                {/* Unified Card Style */}
                <GlassCard style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: theme.spacing(3) }}>
                    <div style={{ width: '56px', height: '56px', background: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing(2), color: theme.colors.primary, fontSize: '1.5rem', boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
                        <i className="bi bi-heart-pulse"></i>
                    </div>
                    <h3 style={{ marginBottom: theme.spacing(2), color: theme.colors.primary, fontSize: '1.5rem' }}>Peticiones</h3>
                    <p style={{ color: theme.colors.text.secondary, lineHeight: '1.6', marginBottom: theme.spacing(3) }}>
                        Estamos aquí para apoyarte. Envía tus solicitudes de oración o ayuda de manera confidencial.
                    </p>
                    <Link to="/peticiones" style={{ textDecoration: 'none' }}>
                        <Button variant="outline">Enviar Petición</Button>
                    </Link>
                </GlassCard>

                <GlassCard style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: theme.spacing(3) }}>
                    <div style={{ width: '56px', height: '56px', background: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing(2), color: theme.colors.secondary, fontSize: '1.5rem', boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
                        <i className="bi bi-journal-check"></i>
                    </div>
                    <h3 style={{ marginBottom: theme.spacing(2), color: theme.colors.secondary, fontSize: '1.5rem' }}>Inscríbete y participa</h3>
                    <p style={{ color: theme.colors.text.secondary, lineHeight: '1.6', marginBottom: theme.spacing(3) }}>
                        No te quedes fuera. Inscríbete a nuestros próximos campamentos, eventos y actividades especiales aquí.
                    </p>
                    <Link to="/inscripciones" style={{ textDecoration: 'none' }}>
                        <Button variant="outline">Inscribirme</Button>
                    </Link>
                </GlassCard>

                <GlassCard style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: theme.spacing(3) }}>
                    <div style={{ width: '56px', height: '56px', background: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing(2), color: theme.colors.accent, fontSize: '1.5rem', boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
                        <i className="bi bi-cash-coin"></i>
                    </div>
                    <h3 style={{ marginBottom: theme.spacing(2), color: theme.colors.accent, fontSize: '1.5rem' }}>Diezmos y Ofrendas</h3>
                    <p style={{ color: theme.colors.text.secondary, lineHeight: '1.6', marginBottom: theme.spacing(3) }}>
                        Honra al Señor con tus bienes y con las primicias de todos tus frutos. Tu fidelidad sostiene la misión de su iglesia.
                    </p>
                    <a href="https://alfoliadventista.org/signin" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Button variant="outline">Saber Más</Button>
                    </a>
                </GlassCard>
            </section>

            {/* Interactive Sections (Map and Calendar) */}
            <section style={{ marginTop: theme.spacing(4) }}>
                <div className="row g-4 align-items-stretch">
                    <div className="col-lg-6">
                        <MapSection />
                    </div>
                    <div className="col-lg-6">
                        <CalendarSection />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
