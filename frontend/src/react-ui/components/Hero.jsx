import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import apiClient from '../../api/client';
import Button from './Button';
import T1 from '../../img/logos/T1.png';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATIC_BACKGROUNDS = [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', // Montañas (Clima)
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80', // Lago (Naturaleza)
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', // Bosque (Clima)
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', // Valle neblina (Naturaleza)
    'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80', // Nieve (Clima)
    'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80', // Desierto (Clima)
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80', // Cascada (Naturaleza)
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80', // Arquitectura limpia (Lugar de culto)
    'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?w=1920&q=80', // Cielo estrellado (Naturaleza)
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80', // Campo (Naturaleza)
];

const Hero = () => {
    const { theme } = useTheme();
    const [billboards, setBillboards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    // Efecto inicial: Carga los datos y limpia el temporizador al salir
    useEffect(() => {
        fetchBillboards();
        return () => stopTimer();
    }, []);

    // Efecto de rotación: Reinicia el reloj cada vez que cambiamos de slide
    useEffect(() => {
        startTimer();
    }, [currentIndex, billboards]);

    const fetchBillboards = async () => {
        try {
            const { data } = await apiClient.get(`/billboards?t=${Date.now()}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            const activeItems = (data || []).map((item) => ({
                ...item,
                media_url: item.media_url || item.mediaUrl || '',
                media_type: item.media_type || item.mediaType || 'image',
                button_text: item.button_text || item.buttonText || '',
                button_link: item.button_link || item.buttonLink || '',
                is_active: item.is_active ?? item.isActive ?? true,
            }));
            console.log('🎬 Billboards recibidos:', activeItems);
            activeItems.forEach((item, idx) => {
                console.log(`   Slide ${idx + 1}: "${item.title}" - URL: ${item.media_url}`);
            });
            setBillboards(activeItems);
        } catch (e) {
            console.error('Error al cargar la cartelera:', e);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Lógica del Temporizador (15 segundos)
     */
    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            nextSlide();
        }, 15000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const nextSlide = () => {
        setCurrentIndex(prev => (prev >= activeSlides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => (prev === 0 ? activeSlides.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    // Pantalla de carga (mientras llegan los datos de la API)
    if (loading) {
        return (
            <section style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </section>
        );
    }

    // Slide de respaldo por si la base de datos está vacía
    const defaultSlide = {
        title: "BIENVENIDO A OASIS",
        description: "Un lugar para conectar con Dios y con la comunidad. Te esperamos cada sábado.",
        media_url: "", 
        media_type: 'image',
        button_text: "CONÓCENOS",
        button_link: "/about"
    };

    // GENERACIÓN DE DIAPOSITIVAS:
    // 1. Las publicaciones reales del servidor (Prioridad 1)
    // 2. Las imágenes estáticas de la naturaleza (Prioridad 2)
    const activeSlides = [
        ...billboards,
        ...STATIC_BACKGROUNDS.map((url, i) => ({
            ...defaultSlide,
            id: `static-${i}`,
            media_url: url,
            // Si hay billboards reales, las estáticas NO llevan texto para que no se mezclen
            // Solo muestran texto si no hay absolutamente ningún anuncio real.
            title: billboards.length > 0 ? "" : defaultSlide.title,
            description: billboards.length > 0 ? "" : defaultSlide.description,
            button_text: billboards.length > 0 ? "" : defaultSlide.button_text
        }))
    ];

    const currentSlide = activeSlides[currentIndex] || defaultSlide;

    /**
     * Normaliza las URLs de medios para asegurar que apunten al backend correcto
     * Si la URL es relativa (/uploads/...), la convierte a URL absoluta del backend
     */
    const normalizeMediaUrl = (url) => {
        if (!url) return url;

        // Si ya es una URL completa (http/https), retornarla tal cual
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Determinar la base de la API (por defecto localhost:3000)
        let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Normalizar la base: quitar /api y asegurar que no termine en /
        const backendUrl = apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

        // Si es una ruta relativa que empieza con /uploads, concatenar
        if (url.startsWith('/uploads/')) {
            return `${backendUrl}${url}`;
        }

        // Si es solo el nombre del archivo (ej: "billboard-123.jpg")
        if (!url.includes('/') && (url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg'))) {
            return `${backendUrl}/uploads/${url}`;
        }

        return url;
    };

    /**
     * Renderizador de Fondo (Media)
     * Detecta si es video (MP4/YouTube) o imagen y genera el HTML correspondiente.
     */
    const renderBackground = (slide, index) => {
        const mediaUrl = normalizeMediaUrl(slide.media_url);

        if (slide.media_type === 'video') {
            const isYoutube = mediaUrl?.includes('youtube.com') || mediaUrl?.includes('youtu.be');

            if (isYoutube) {
                let videoId = '';
                if (mediaUrl.includes('embed/')) {
                    videoId = mediaUrl.split('embed/')[1].split('?')[0];
                } else if (mediaUrl.includes('v=')) {
                    videoId = mediaUrl.split('v=')[1].split('&')[0];
                }

                return (
                    <motion.div 
                        key={`vid-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="ratio ratio-16x9" 
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', zIndex: -3 }}
                    >
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&background=1`}
                            frameBorder="0"
                            allow="autoplay; fullscreen"
                            style={{ pointerEvents: 'none' }}
                        ></iframe>
                    </motion.div>
                );
            }

            return (
                <motion.video
                    key={`vfile-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    autoPlay muted loop playsInline
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, background: '#0a0a0a' }}
                >
                    <source src={mediaUrl} type="video/mp4" />
                </motion.video>
            );
        }

        // Usar imagen de la galería estática si no hay una url válida o si el usuario quiere estáticas
        const staticFallback = STATIC_BACKGROUNDS[index % STATIC_BACKGROUNDS.length];
        const finalUrl = (slide.media_url && slide.media_url.length > 10) ? mediaUrl : staticFallback;

        return (
            <motion.div 
                key={`img-${index}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: '#0a0a0a',
                    backgroundImage: `url("${finalUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 1
                }} 
            />
        );
    };

    return (
        <section 
            className="hero-section"
            style={{ 
                height: '100vh', 
                minHeight: '650px', 
                position: 'relative', 
                overflow: 'hidden', 
                display: 'flex', 
                alignItems: (!currentSlide.title && !currentSlide.description) ? 'flex-end' : 'center',
                backgroundColor: '#000' // Base negra total
            }}
        >
            {/* 1. Fondo de Media con Transición Suave */}
            <AnimatePresence mode="popLayout">
                {renderBackground(currentSlide, currentIndex)}
            </AnimatePresence>

            {/* 2. Overlays Visuales (Marcas de agua y texturas) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${T1})`, backgroundSize: 'cover', opacity: 0.3, zIndex: 5, pointerEvents: 'none' }} />
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: `linear-gradient(to right, rgba(0,0,0,${currentSlide.styles?.overlayOpacity ?? 0.8}) 0%, rgba(0,0,0,${(currentSlide.styles?.overlayOpacity ?? 0.8) * 0.4}) 30%, rgba(0,0,0,0.2) 100%)`,
                zIndex: 6
            }} />

            {/* 3. Contenido (Textos y Botones) con Transición */}
            <div className="container" style={{ position: 'relative', zIndex: 10, color: '#fff' }}>
                <div className="row">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentIndex}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="col-lg-8" 
                            style={{ 
                                opacity: currentSlide.styles?.textOpacity ?? 1 
                            }}
                        >
                            {currentSlide.styles?.iconName && LucideIcons[currentSlide.styles.iconName] && (
                                <div className="mb-4" style={{ color: currentSlide.styles.iconColor || '#fff' }}>
                                    {React.createElement(LucideIcons[currentSlide.styles.iconName], { 
                                        size: parseInt(currentSlide.styles.iconSize || 60) 
                                    })}
                                </div>
                            )}
                            <h1 style={{
                                fontFamily: currentSlide.styles?.titleFont || 'ModernAge, sans-serif',
                                fontSize: currentSlide.styles?.titleSize || 'clamp(3rem, 10vw, 5.5rem)',
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                lineHeight: 1.1,
                                textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                color: currentSlide.styles?.titleColor || '#ffffff',
                                background: !currentSlide.styles?.titleColor ? `linear-gradient(135deg, #ffffff 0%, ${theme.colors.secondary} 100%)` : 'none',
                                WebkitBackgroundClip: !currentSlide.styles?.titleColor ? 'text' : 'unset',
                                WebkitTextFillColor: !currentSlide.styles?.titleColor ? 'transparent' : 'unset'
                            }}>
                                {currentSlide.title}
                            </h1>
                            <p style={{
                                fontSize: currentSlide.styles?.descSize || 'clamp(1rem, 2.5vw, 1.35rem)',
                                fontFamily: currentSlide.styles?.descFont || 'inherit',
                                color: currentSlide.styles?.descColor || '#ffffff',
                                marginBottom: '2rem',
                                opacity: currentSlide.styles?.textOpacity ?? 0.9,
                                maxWidth: '700px',
                                lineHeight: 1.6,
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                padding: '0 8px'
                            }}>
                                {currentSlide.description}
                            </p>

                            <div className="hero-buttons" style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                flexWrap: 'wrap',
                                justifyContent: (!currentSlide.title && !currentSlide.description) ? 'flex-start' : 'flex-start',
                                marginBottom: (!currentSlide.title && !currentSlide.description) ? '80px' : '0'
                            }}>
                                {currentSlide.button_text && (
                                    <Link to={currentSlide.button_link || '#'} style={{ textDecoration: 'none', flex: '0 1 auto', minWidth: '200px', maxWidth: '300px' }}>
                                        <Button style={{ padding: '14px 32px', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', width: '100%' }}>
                                            {currentSlide.button_text}
                                        </Button>
                                    </Link>
                                )}
                                <Link to="/about" style={{ textDecoration: 'none', flex: '0 1 auto', minWidth: '200px', maxWidth: '300px' }}>
                                    <button className="btn" style={{
                                        padding: '14px 32px', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.8)',
                                        background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold',
                                        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', backdropFilter: 'blur(5px)', transition: 'all 0.3s',
                                        width: '100%'
                                    }}>
                                        <i className="bi bi-info-circle me-2"></i>Conócenos
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 4. Controles de Navegación Lateral */}
            {activeSlides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="btn text-white hide-mobile" style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '60px', height: '60px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', zIndex: 10 }}>
                        <i className="bi bi-chevron-left fs-3"></i>
                    </button>
                    <button onClick={nextSlide} className="btn text-white hide-mobile" style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '60px', height: '60px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', zIndex: 10 }}>
                        <i className="bi bi-chevron-right fs-3"></i>
                    </button>
                </>
            )}

            {/* 5. Indicadores (Puntos) Inferiores */}
            {activeSlides.length > 1 && (
                <div style={{ position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px', zIndex: 10 }}>
                    {activeSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            style={{
                                width: idx === currentIndex ? '40px' : '12px', height: '12px',
                                background: idx === currentIndex ? theme.colors.primary : 'rgba(255,255,255,0.4)',
                                border: 'none', borderRadius: '6px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            )}

            <style>{`
                @keyframes oasisSlideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 992px) {
                    .hide-mobile { display: none !important; }
                }
                @media (max-width: 768px) {
                    .hero-buttons {
                        flex-direction: column !important;
                        width: 100% !important;
                        padding: 0 16px !important;
                    }
                    .hero-buttons > a {
                        min-width: 100% !important;
                        max-width: 100% !important;
                    }
                }
                @media (max-width: 576px) {
                    .hero-buttons {
                        padding: 0 8px !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default Hero;