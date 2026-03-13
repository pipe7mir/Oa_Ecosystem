import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Hero from '../components/Hero';
import Announcements from '../components/Announcements';
import MapSection from '../components/MapSection';
import CalendarSection from '../components/CalendarSection';
import apiClient from '../../api/client';
import useAppMode from '../../hooks/useAppMode'; // Added based on instruction to potentially use isMobile
import { useToast } from '../components/Toast'; // Added based on instruction, though not used in Home.jsx currently

const Home = () => {
    const { theme } = useTheme();
    const { isMobile } = useAppMode(); // Added based on instruction to potentially use isMobile
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
            <section className="feature-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: theme.spacing(3),
                marginTop: theme.spacing(4),
                padding: `0 ${theme.spacing(2)}`
            }}>
                {/* Unified Card Style */}
                <GlassCard className="glass-card" style={{ 
                    minHeight: '260px', display: 'flex', flexDirection: 'column', 
                    padding: theme.spacing(3.5), borderRadius: '24px',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(91,46,166,0.1)' 
                }}>
                    <div className="icon-box" style={{ 
                        width: '60px', height: '60px', 
                        background: 'rgba(91,46,166,0.1)', borderRadius: '18px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        marginBottom: theme.spacing(2.5), color: theme.colors.primary, 
                        fontSize: '1.8rem'
                    }}>
                        <i className="bi bi-heart-fill"></i>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: theme.spacing(1.5), color: theme.colors.text.primary, fontWeight: 800, fontSize: '1.4rem' }}>Peticiones</h3>
                        <p style={{ color: theme.colors.text.secondary, lineHeight: '1.6', marginBottom: theme.spacing(3), fontSize: '0.95rem', fontWeight: 500 }}>
                            Estamos aquí para apoyarte. Envía tus solicitudes de oración de manera confidencial.
                        </p>
                    </div>
                    <Link to="/peticiones" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                        <Button style={{ width: '100%', background: theme.colors.primary, color: '#fff' }}>Enviar Petición</Button>
                    </Link>
                </GlassCard>

                <GlassCard className="glass-card" style={{ 
                    minHeight: '260px', display: 'flex', flexDirection: 'column', 
                    padding: theme.spacing(3.5), borderRadius: '24px',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(242,201,76,0.15)' 
                }}>
                    <div className="icon-box" style={{ 
                        width: '60px', height: '60px', 
                        background: 'rgba(242,201,76,0.15)', borderRadius: '18px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        marginBottom: theme.spacing(2.5), color: '#d4a017', 
                        fontSize: '1.8rem'
                    }}>
                        <i className="bi bi-calendar-check-fill"></i>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: theme.spacing(1.5), color: theme.colors.text.primary, fontWeight: 800, fontSize: '1.4rem' }}>Inscríbete</h3>
                        <p style={{ color: theme.colors.text.secondary, lineHeight: '1.6', marginBottom: theme.spacing(3), fontSize: '0.95rem', fontWeight: 500 }}>
                            No te quedes fuera. Inscríbete a nuestros próximos campamentos y eventos especiales.
                        </p>
                    </div>
                    <Link to="/inscripciones" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                        <Button style={{ width: '100%', background: '#F2C94C', color: '#1e1b4b' }}>Inscribirme</Button>
                    </Link>
                </GlassCard>

                <GlassCard className="glass-card" style={{ 
                    minHeight: '260px', display: 'flex', flexDirection: 'column', 
                    padding: theme.spacing(3.5), borderRadius: '24px',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(0,0,0,0.05)' 
                }}>
                    <div className="icon-box" style={{ 
                        width: '60px', height: '60px', 
                        background: 'rgba(0,0,0,0.03)', borderRadius: '18px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        marginBottom: theme.spacing(2.5), color: '#2d3436', 
                        fontSize: '1.8rem'
                    }}>
                        <i className="bi bi-wallet2"></i>
                    </div>
                    <div>
                        <h3 style={{ marginBottom: theme.spacing(1.5), color: theme.colors.text.primary, fontWeight: 800, fontSize: '1.4rem' }}>Ofrendas</h3>
                        <p style={{ color: theme.colors.text.secondary, lineHeight: '1.6', marginBottom: theme.spacing(3), fontSize: '0.95rem', fontWeight: 500 }}>
                            Tu fidelidad sostiene la misión. Haz tus donaciones y diezmos de forma segura.
                        </p>
                    </div>
                    <a href="https://alfoliadventista.org/signin" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                        <Button variant="outline" style={{ width: '100%', border: '2px solid #e2e8f0' }}>Saber Más</Button>
                    </a>
                </GlassCard>
            </section>

            {/* Interactive Sections (Map and Calendar) */}
            <section style={{ marginTop: theme.spacing(4), padding: `0 ${theme.spacing(2)}` }}>
                <div className="row g-4 align-items-stretch map-calendar-row">
                    <div className="col-lg-6 col-md-12">
                        <MapSection />
                    </div>
                    <div className="col-lg-6 col-md-12">
                        <CalendarSection />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
