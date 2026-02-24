import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { theme } from '../styles/theme';
import GlassCard from './GlassCard';

/* ─── Helper: Build full image URL safely ─────────────────────── */
const buildUrl = (image_url) => {
    if (!image_url) return null;
    if (image_url.startsWith('http')) return image_url;
    const base = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:8000';
    return `${base}${image_url.startsWith('/') ? '' : '/'}${image_url}`;
};

/* ─── Fullscreen Modal ───────────────────────────────────────────
   YouTube-style: 16:9 stage.
   - Landscape image  → fills stage completely (object-fit: cover)
   - Portrait image   → centered with blurred background fill
   Transitions: fade+scale on open/close, slide on next/prev
──────────────────────────────────────────────────────────────── */
const FullscreenModal = ({ announcement, onClose, onNext, onPrev, hasNext, hasPrev, transitionDir }) => {
    const [visible, setVisible] = useState(false);
    const [imgVisible, setImgVisible] = useState(false);
    const stageRef = useRef(null);
    const imageUrl = buildUrl(announcement?.image_url);

    // Bloqueo de scroll y animación de entrada
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const frame = requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
        });
        return () => {
            document.body.style.overflow = '';
            cancelAnimationFrame(frame);
        };
    }, []);

    // Animación de transición entre imágenes
    useEffect(() => {
        setImgVisible(false);
        const t = setTimeout(() => setImgVisible(true), 80);
        return () => clearTimeout(t);
    }, [announcement?.id]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 320);
    };

    const handleFullscreen = (e) => {
        e.stopPropagation();
        if (stageRef.current) {
            const el = stageRef.current;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.msRequestFullscreen) el.msRequestFullscreen();
        }
    };

    const slideStyle = {
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        opacity: imgVisible ? 1 : 0,
        transform: imgVisible
            ? 'translateX(0)'
            : transitionDir === 'next'
                ? 'translateX(40px)'
                : 'translateX(-40px)',
    };

    if (!announcement) return null;

    const navBtnStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        color: 'white',
        fontSize: '1.6rem',
        cursor: 'pointer',
        zIndex: 10010,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(8px)',
    };

    return createPortal(
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.97)',
                transition: 'opacity 0.32s cubic-bezier(.4,0,.2,1), backdrop-filter 0.32s',
                opacity: visible ? 1 : 0,
                backdropFilter: visible ? 'blur(20px)' : 'blur(0px)',
            }}
            onClick={handleClose}
        >
            {/* Botones de Control */}
            <div style={{ position: 'absolute', top: '20px', right: '24px', zIndex: 10020, display: 'flex', gap: '12px' }}>
                <button
                    onClick={handleFullscreen}
                    style={{
                        background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                        width: '48px', height: '48px', color: 'white', fontSize: '1.3rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', backdropFilter: 'blur(8px)',
                    }}
                    title="Modo Proyectar"
                >
                    <i className="bi bi-display"></i>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleClose(); }}
                    style={{
                        background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                        width: '48px', height: '48px', color: 'white', fontSize: '1.3rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', backdropFilter: 'blur(8px)',
                    }}
                >
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            {/* Navegación Lateral */}
            {hasNext && (
                <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ ...navBtnStyle, right: '20px' }}>
                    <i className="bi bi-chevron-right"></i>
                </button>
            )}
            {hasPrev && (
                <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ ...navBtnStyle, left: '20px' }}>
                    <i className="bi bi-chevron-left"></i>
                </button>
            )}

            {/* Stage Principal (Contenedor de Imagen) */}
            <div
                ref={stageRef}
                id="fullscreen-stage"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'black'
                }}
            >
                {imageUrl ? (
                    <>
                        {/* Relleno de fondo con desenfoque */}
                        <div
                            style={{
                                position: 'absolute', inset: 0, zIndex: 0,
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(40px) brightness(0.3)',
                                transform: 'scale(1.1)',
                            }}
                        />

                        {/* Imagen Principal - Ajustes de Tamaño y Posición */}
                        <img
                            key={announcement.id}
                            src={imageUrl}
                            alt={announcement.title}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                // Tamaño máximo para llenar la pantalla
                                maxWidth: '100vw',
                                maxHeight: '100vh',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                borderRadius: '0',
                                boxShadow: '0 0 100px rgba(0,0,0,0.8)',
                                ...slideStyle,
                            }}
                        />
                    </>
                ) : (
                    /* Estado si no hay imagen */
                    <div style={{
                        textAlign: 'center', zIndex: 1, width: '100%', height: '100%',
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <i className="bi bi-megaphone text-white opacity-25" style={{ fontSize: '8rem' }}></i>
                    </div>
                )}

                {/* Overlay de información (Visible cuando no hay imagen) */}
                {!imageUrl && (
                    <div
                        style={{
                            position: 'absolute', bottom: '40px', left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%', maxWidth: '520px', zIndex: 10,
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px', padding: '24px',
                            color: 'white', opacity: imgVisible ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            {announcement.tag && (
                                <span style={{ background: theme.colors.primary, padding: '2px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    {announcement.tag}
                                </span>
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{announcement.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>{announcement.content || announcement.description}</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

/* ─── Main Component ─────────────────────────────────────────── */
const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [transitionDir, setTransitionDir] = useState('next');
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                const response = await axios.get(`${apiUrl}/announcements`);
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setAnnouncements(response.data);
                } else {
                    setAnnouncements([{
                        id: 1, title: 'Lanzamiento Nueva Web', tag: 'Tecnología',
                        date: '2023-11-20',
                        content: 'Estamos muy emocionados de presentar nuestra nueva plataforma digital.',
                        image_url: null
                    }]);
                }
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    /* Auto-scroll the card strip */
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [announcements]);

    /* Keyboard navigation */
    const currentIndex = selectedAnnouncement
        ? announcements.findIndex(a => a.id === selectedAnnouncement.id)
        : -1;

    const handleNext = useCallback(() => {
        if (currentIndex < announcements.length - 1) {
            setTransitionDir('next');
            setSelectedAnnouncement(announcements[currentIndex + 1]);
        }
    }, [currentIndex, announcements]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setTransitionDir('prev');
            setSelectedAnnouncement(announcements[currentIndex - 1]);
        }
    }, [currentIndex, announcements]);

    useEffect(() => {
        if (!selectedAnnouncement) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
            if (e.key === 'Escape') setSelectedAnnouncement(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedAnnouncement, handleNext, handlePrev]);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>;
    if (announcements.length === 0) return <div className="text-center p-5 text-muted">No hay novedades.</div>;

    return (
        <section style={{ maxWidth: '100%', overflow: 'hidden', padding: '40px 0', position: 'relative' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: theme.spacing(2) }}>
                <h2 style={{
                    fontFamily: '"San Francisco", sans-serif', fontWeight: '600',
                    fontSize: '2rem', color: theme.colors.text.primary, marginBottom: theme.spacing(3)
                }}>
                    Novedades
                </h2>
            </div>

            {/* ── Card strip ── */}
            <div
                ref={scrollContainerRef}
                className="hide-scrollbar"
                style={{
                    display: 'flex', gap: theme.spacing(3), overflowX: 'auto',
                    padding: `0 ${theme.spacing(4)} 40px`, scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none', msOverflowStyle: 'none',
                }}
            >
                {announcements.map((announcement) => {
                    const thumbUrl = buildUrl(announcement.image_url);
                    return (
                        <div key={announcement.id} style={{ minWidth: '320px', maxWidth: '320px', scrollSnapAlign: 'start', flexShrink: 0 }}>
                            <div
                                className="announcement-card h-100"
                                onClick={() => { setTransitionDir('next'); setSelectedAnnouncement(announcement); }}
                                style={{ cursor: 'pointer' }}
                            >
                                <GlassCard style={{
                                    padding: '0', overflow: 'hidden', height: '100%', minHeight: '400px',
                                    display: 'flex', flexDirection: 'column',
                                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(15px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}>
                                    <div style={{
                                        height: '280px', width: '100%', position: 'relative',
                                        backgroundImage: thumbUrl
                                            ? `url(${thumbUrl})`
                                            : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                    }}>
                                        {!thumbUrl && (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="bi bi-megaphone text-white opacity-50 fs-1"></i>
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                                            <span className="badge bg-white text-primary shadow-sm px-3 py-2">{announcement.tag}</span>
                                        </div>
                                        {/* Expand hint */}
                                        <div style={{
                                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            opacity: 0, transition: 'opacity 0.2s',
                                            background: 'rgba(0,0,0,0.3)',
                                        }} className="card-hover-overlay">
                                            <i className="bi bi-fullscreen text-white" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{
                                            fontFamily: '"San Francisco", sans-serif', fontWeight: 'bold',
                                            fontSize: '1.25rem', color: theme.colors.text.primary,
                                            marginBottom: '12px', lineHeight: 1.3,
                                        }}>
                                            {announcement.title}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.95rem', color: theme.colors.text.secondary,
                                            marginBottom: '0', flexGrow: 1,
                                            display: '-webkit-box', WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {announcement.content || announcement.description}
                                        </p>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Fullscreen Modal ── */}
            {selectedAnnouncement && (
                <FullscreenModal
                    announcement={selectedAnnouncement}
                    onClose={() => setSelectedAnnouncement(null)}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    hasNext={currentIndex < announcements.length - 1}
                    hasPrev={currentIndex > 0}
                    transitionDir={transitionDir}
                />
            )}

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .announcement-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .announcement-card:hover { transform: translateY(-8px); }
                .announcement-card:hover .card-hover-overlay { opacity: 1 !important; }

                #fullscreen-stage:fullscreen {
                    width: 100vw !important;
                    height: 100vh !important;
                    background: black !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                #fullscreen-stage:fullscreen img {
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                    width: auto !important;
                    height: auto !important;
                    object-fit: contain !important;
                    box-shadow: none !important;
                }
            `}</style>
        </section>
    );
};

export default Announcements;
