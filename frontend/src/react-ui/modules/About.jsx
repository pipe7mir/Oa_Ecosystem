import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { theme } from '../styles/theme';
import GlassCard from '../components/GlassCard';
import apiClient from '../../api/client';

const About = () => {
    const [data, setData] = useState({
        about_hero_title: 'Nuestra Identidad',
        about_hero_content: 'Somos una comunidad dedicada a transformar vidas a través del amor, el servicio y la innovación. Creemos en construir un futuro donde todos tengan un lugar.',
        about_mission_title: 'Nuestra Misión',
        about_mission_content: 'Llevar el mensaje de esperanza a cada rincón, restaurando vidas y familias a través del amor incondicional y el servicio desinteresado a nuestra comunidad.',
        about_mission_icon: 'bi-heart-pulse-fill',
        about_vision_title: 'Nuestra Visión',
        about_vision_content: 'Ser una iglesia relevante y vibrante que impacta su entorno, formando generaciones que viven con propósito y pasión por la transformación social y espiritual.',
        about_vision_icon: 'bi-eye-fill',
        about_values_title: 'Valores',
        about_values_content: 'Integridad en nuestro caminar, Excelencia en nuestro servicio, Unidad en nuestra diversidad y Amor en todas nuestras acciones como fundamento de todo lo que hacemos.',
        about_values_icon: 'bi-shield-check',
        about_history_title: 'Nuestra Historia',
        about_history_content: 'Fundada en 2020, OASIS nació como una respuesta a la necesidad de conexión en tiempos difíciles. Lo que comenzó como un pequeño grupo en una sala de estar, se ha convertido en un movimiento dinámico que abraza la tecnología y la tradición para crear experiencias significativas.',
        about_history_image: null,
    });
    const [boardMembers, setBoardMembers] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [settingsRes, boardRes, galleryRes] = await Promise.all([
                    apiClient.get('/settings'),
                    apiClient.get('/board-members'),
                    apiClient.get('/gallery-items')
                ]);

                // Flatten settings array to object
                const settingsObj = Array.isArray(settingsRes.data) ?
                    settingsRes.data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                    settingsRes.data;

                const aboutKeys = Object.keys(data);
                const filtered = {};
                aboutKeys.forEach(k => {
                    if (settingsObj[k]) filtered[k] = settingsObj[k];
                });
                setData(prev => ({ ...prev, ...filtered }));
                setBoardMembers(boardRes.data);
                setGalleryItems(galleryRes.data);
            } catch (e) {
                console.error("Error loading about data", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Body scroll lock to prevent background scrolling when modal is open
    useEffect(() => {
        if (selectedMember) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedMember]);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;

        // Try multiple sources for base URL
        let base = import.meta.env.VITE_API_BASE_URL;
        if (!base && import.meta.env.VITE_API_URL) {
            base = import.meta.env.VITE_API_URL.replace('/api', '');
        }

        // If still no base, use a sensible default for local dev if on a common port
        if (!base) {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                base = `http://${window.location.hostname}:8000`;
            }
        }

        base = base || '';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${base.replace(/\/$/, '')}${cleanUrl}`;
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out', fontFamily: theme.fonts.body }}>
            <header style={{ textAlign: 'center', marginBottom: theme.spacing(8) }}>
                <h2 style={{ fontFamily: theme.fonts.titles, fontSize: '3rem', color: theme.colors.secondary, marginBottom: theme.spacing(2) }}>
                    {data.about_hero_title}
                </h2>
                <p style={{ color: theme.colors.text.secondary, maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {data.about_hero_content}
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: theme.spacing(4) }}>
                {[
                    { icon: data.about_mission_icon, title: data.about_mission_title, content: data.about_mission_content, color: theme.colors.primary },
                    { icon: data.about_vision_icon, title: data.about_vision_title, content: data.about_vision_content, color: theme.colors.secondary },
                    { icon: data.about_values_icon, title: data.about_values_title, content: data.about_values_content, color: theme.colors.accent }
                ].map((item, i) => (
                    <GlassCard key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', color: item.color, marginBottom: theme.spacing(2) }}>
                            <i className={`bi ${item.icon}`}></i>
                        </div>
                        <h3 style={{ marginBottom: theme.spacing(2), fontFamily: theme.fonts.titles }}>{item.title}</h3>
                        <p style={{ color: theme.colors.text.secondary, whiteSpace: 'pre-wrap' }}>{item.content}</p>
                    </GlassCard>
                ))}
            </div>

            <div style={{ marginTop: theme.spacing(8) }}>
                <GlassCard>
                    <div style={{ display: 'flex', gap: theme.spacing(4), alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3 style={{ color: theme.colors.primary, fontSize: '2rem', marginBottom: theme.spacing(2), fontFamily: theme.fonts.titles }}>{data.about_history_title}</h3>
                            <p style={{ lineHeight: '1.8', color: theme.colors.text.secondary, whiteSpace: 'pre-wrap' }}>{data.about_history_content}</p>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px', height: '400px', background: 'rgba(0,0,0,0.05)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                            {data.about_history_image ? <img src={getImageUrl(data.about_history_image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="h-100 d-flex align-items-center justify-content-center"><i className="bi bi-image fs-1 opacity-25"></i></div>}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* LEADERSHIP SECTION */}
            {boardMembers.length > 0 && (
                <div style={{ marginTop: theme.spacing(10) }}>
                    <h2 style={{ textAlign: 'center', fontFamily: theme.fonts.titles, fontSize: '2.5rem', marginBottom: theme.spacing(5), color: theme.colors.primary }}>
                        Nuestra Directiva
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 300px))', gap: theme.spacing(3), maxWidth: '1100px', margin: '0 auto' }}>
                        {boardMembers.map(member => (
                            <GlassCard
                                key={member.id}
                                className="member-card"
                                style={{ textAlign: 'center', padding: 0, overflow: 'hidden', cursor: member.fullscreen_image_url ? 'pointer' : 'default' }}
                                onClick={() => member.fullscreen_image_url && setSelectedMember(member)}
                            >
                                <div className="member-image-container" style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', position: 'relative' }}>
                                    <img src={getImageUrl(member.image_url)} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {member.type === 'group' && (
                                        <div style={{ position: 'absolute', top: '35px', right: '15px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: theme.colors.primary, padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                            Grupo
                                        </div>
                                    )}
                                    {member.fullscreen_image_url && (
                                        <div className="view-more-hint" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', color: 'white', padding: '15px', opacity: 0, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <i className="bi bi-fullscreen"></i>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>VER PANTALLA COMPLETA</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '0.8rem 0.6rem', textAlign: 'center' }}>
                                    {member.type === 'group' ? (
                                        <h4 style={{ color: theme.colors.primary, margin: '0 0 0.2rem', fontWeight: 'bold', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: theme.fonts.titles }}>
                                            {member.role}
                                        </h4>
                                    ) : (
                                        <>
                                            <h4 style={{ color: theme.colors.text.primary, margin: '0 0 0.1rem', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: theme.fonts.titles }}>{member.name}</h4>
                                            <h6 style={{ color: theme.colors.primary, fontWeight: '800', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.5px', marginBottom: '0.3rem', opacity: 0.9 }}>{member.role}</h6>
                                        </>
                                    )}
                                    {member.description && (
                                        <p style={{ fontSize: '0.7rem', color: theme.colors.text.secondary, lineHeight: '1.4', margin: 0, opacity: 0.8, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {member.description}
                                        </p>
                                    )}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                    <style>{`
                        .member-card { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); border: 1px solid rgba(255,255,255,0.1) !important; }
                        .member-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important; }
                        .member-card:hover .member-image-container img { transform: scale(1.05); transition: transform 0.6s ease; }
                        .member-card:hover .view-more-hint { opacity: 1 !important; transform: translateY(0); }
                    `}</style>
                </div>
            )}

            {/* FULLSCREEN MODAL - Rendered via Portal for perfect centering */}
            {selectedMember && createPortal(
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 99999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.98)',
                        animation: 'fadeIn 0.32s cubic-bezier(.4,0,.2,1)',
                        backdropFilter: 'blur(25px)',
                        overflow: 'hidden'
                    }}
                    onClick={() => setSelectedMember(null)}
                >
                    {/* Blurred Background Fill */}
                    <div
                        style={{
                            position: 'absolute', inset: 0, zIndex: 0,
                            backgroundImage: `url(${getImageUrl(selectedMember.fullscreen_image_url || selectedMember.image_url)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(50px) brightness(0.2)',
                            transform: 'scale(1.1)',
                        }}
                    />

                    {/* Close Button */}
                    <button
                        style={{
                            position: 'absolute', top: '25px', right: '25px',
                            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                            fontSize: '1.4rem', cursor: 'pointer', zIndex: 100020,
                            width: '50px', height: '50px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', backdropFilter: 'blur(10px)'
                        }}
                        onClick={() => setSelectedMember(null)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    {/* Image Stage - Perfectly Centered */}
                    <div
                        style={{
                            position: 'relative',
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            animation: 'zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={getImageUrl(selectedMember.fullscreen_image_url || selectedMember.image_url)}
                            alt={selectedMember.name}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                maxWidth: '100vw',
                                maxHeight: '100vh',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                                boxShadow: '0 0 120px rgba(0,0,0,1)'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getImageUrl(selectedMember.image_url);
                            }}
                        />

                        {/* INFO OVERLAY */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '60px 80px',
                            background: 'linear-gradient(transparent, rgba(0,0,0,1))',
                            color: 'white',
                            zIndex: 2
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '25px', flexWrap: 'wrap', maxWidth: '1400px', margin: '0 auto' }}>
                                <div style={{ flex: 1, minWidth: '350px' }}>
                                    {selectedMember.type !== 'group' && (
                                        <h2 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 8px', textShadow: '0 2px 20px rgba(0,0,0,1)', fontFamily: theme.fonts.titles }}>{selectedMember.name}</h2>
                                    )}
                                    <h4 style={{ color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: '5px', fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', fontFamily: theme.fonts.titles }}>
                                        {selectedMember.role}
                                    </h4>
                                    <p style={{ color: 'rgba(255,255,255,0.95)', maxWidth: '900px', lineHeight: '1.8', fontSize: '1.25rem', margin: 0, textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
                                        {selectedMember.description}
                                    </p>
                                </div>
                                {selectedMember.type === 'group' && (
                                    <div style={{ background: theme.colors.primary, color: 'white', padding: '12px 30px', borderRadius: '40px', fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                                        Departamento
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* INFINITE GALLERY CAROUSEL */}
            {galleryItems.length > 0 && (
                <div style={{ marginTop: theme.spacing(12), overflow: 'hidden', position: 'relative', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
                    <h2 style={{ textAlign: 'center', fontFamily: theme.fonts.titles, fontSize: '2.5rem', marginBottom: theme.spacing(5), color: theme.colors.secondary }}>
                        Nuestra Comunidad
                    </h2>
                    <div className="infinite-scroller">
                        <div className="scroller-inner">
                            {[...galleryItems, ...galleryItems].map((item, idx) => (
                                <div key={idx} className="scroller-item" style={{ display: 'inline-block', position: 'relative', margin: '0 10px', width: '350px', height: '250px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                    <img src={getImageUrl(item.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {(item.title || item.description) && (
                                        <div className="scroller-caption" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 15px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', opacity: 0, transition: 'opacity 0.3s ease' }}>
                                            {item.title && <h6 style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{item.title}</h6>}
                                            {item.description && <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>{item.description}</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* GLOBAL STYLES & ANIMATIONS */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .member-card { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); border: 1px solid rgba(255,255,255,0.1) !important; }
                .member-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important; }
                .member-card:hover .member-image-container img { transform: scale(1.05); transition: transform 0.6s ease; }
                .member-card:hover .view-more-hint { opacity: 1 !important; transform: translateY(0); }
                .infinite-scroller { overflow: hidden; white-space: nowrap; width: 100%; position: relative; }
                .scroller-inner { display: inline-block; animation: scroll 60s linear infinite; }
                .scroller-inner:hover { animation-play-state: paused; }
                .scroller-item:hover .scroller-caption { opacity: 1 !important; }
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default About;
