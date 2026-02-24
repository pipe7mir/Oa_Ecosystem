import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { theme } from '../styles/theme';
import Button from './Button';
import T1 from '../img/logos/T1.png';

/**
 * Componente Hero (Cartelera Dinámica)
 * -----------------------------------
 * Este componente es el corazón visual de la página de inicio. 
 * Implementa un carrusel (Billboard) que:
 * 1. Carga dinámicamente diapositivas desde la API (/billboards).
 * 2. Soporta fondos de Imagen y Video (incluyendo YouTube).
 * 3. Rota automáticamente cada 15 segundos.
 * 4. Aplica un diseño premium con Glassmorphism y degradados.
 */
const Hero = () => {
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
        if (billboards.length > 1) {
            startTimer();
        }
    }, [currentIndex, billboards]);

    const fetchBillboards = async () => {
        try {
            const res = await apiClient.get('/billboards');
            // Solo mostramos lo que el administrador marcó como activo
            const activeItems = res.data.filter(b => b.is_active);
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
        setCurrentIndex(prev => (prev === billboards.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => (prev === 0 ? billboards.length - 1 : prev - 1));
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
        media_url: "https://images.unsplash.com/photo-1544427928-c49cdfebf194?auto=format&fit=crop&q=80",
        media_type: 'image',
        button_text: "CONÓCENOS",
        button_link: "/about"
    };

    const activeSlides = billboards.length > 0 ? billboards : [defaultSlide];
    const currentSlide = activeSlides[currentIndex];

    /**
     * Renderizador de Fondo (Media)
     * Detecta si es video (MP4/YouTube) o imagen y genera el HTML correspondiente.
     */
    const renderBackground = (slide) => {
        if (slide.media_type === 'video') {
            const isYoutube = slide.media_url.includes('youtube.com') || slide.media_url.includes('youtu.be');

            if (isYoutube) {
                let videoId = '';
                if (slide.media_url.includes('embed/')) {
                    videoId = slide.media_url.split('embed/')[1].split('?')[0];
                } else if (slide.media_url.includes('v=')) {
                    videoId = slide.media_url.split('v=')[1].split('&')[0];
                }

                return (
                    <div className="ratio ratio-16x9" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', zIndex: -3 }}>
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&background=1`}
                            frameBorder="0"
                            allow="autoplay; fullscreen"
                            style={{ pointerEvents: 'none' }}
                        ></iframe>
                    </div>
                );
            }

            return (
                <video
                    autoPlay muted loop playsInline
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -3 }}
                >
                    <source src={slide.media_url} type="video/mp4" />
                </video>
            );
        }

        return (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: `url(${slide.media_url})`, backgroundSize: 'cover',
                backgroundPosition: 'center', zIndex: -3, transition: 'background-image 1s ease-in-out'
            }} />
        );
    };

    return (
        <section style={{ height: '100vh', minHeight: '650px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            {/* 1. Fondo de Media */}
            {renderBackground(currentSlide)}

            {/* 2. Overlays Visuales (Marcas de agua y texturas) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${T1})`, backgroundSize: 'cover', opacity: 0.3, zIndex: -2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)', zIndex: -1 }} />

            {/* 3. Contenido (Textos y Botones) */}
            <div className="container" style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                <div className="row">
                    <div className="col-lg-8" style={{ animation: 'oasisSlideUp 0.8s ease-out forwards' }}>
                        <h1 style={{
                            fontFamily: 'ModernAge, sans-serif',
                            fontSize: 'clamp(3rem, 10vw, 5.5rem)',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            lineHeight: 1.1,
                            textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                            background: `linear-gradient(135deg, #ffffff 0%, ${theme.colors.secondary} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {currentSlide.title}
                        </h1>
                        <p style={{
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
                            marginBottom: '3rem',
                            opacity: 0.9,
                            maxWidth: '700px',
                            lineHeight: 1.6,
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}>
                            {currentSlide.description}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {currentSlide.button_text && (
                                <Link to={currentSlide.button_link || '#'} style={{ textDecoration: 'none' }}>
                                    <Button style={{ padding: '16px 45px', fontSize: '1.15rem' }}>
                                        {currentSlide.button_text}
                                    </Button>
                                </Link>
                            )}
                            <Link to="/about" style={{ textDecoration: 'none' }}>
                                <button className="btn" style={{
                                    padding: '16px 45px', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.8)',
                                    background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold',
                                    fontSize: '1.15rem', backdropFilter: 'blur(5px)', transition: 'all 0.3s'
                                }}>
                                    <i className="bi bi-info-circle me-2"></i>Conócenos
                                </button>
                            </Link>
                        </div>
                    </div>
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
                @media (max-width: 768px) {
                    .hide-mobile { display: none; }
                }
            `}</style>
        </section>
    );
};

export default Hero;
