import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import OasisInfiniteEngine from './OasisInfiniteEngine';
import SlideWrapper from './SlideWrapper';

// ─── Logo assets ────────────────────────────────────────────────────────────
import logoOasis from '../img/logos/LOGO1.png';
import logoIasd from '../img/logos/IASD1.png';

// ─── Biblioteca de imágenes y logos ─────────────────────────────────────────
const IMAGE_LIBRARY = {
    logos: [
        { id: 'logo-oasis-main', name: 'Oasis Principal', url: '/src/img/logos/LOGO1.png' },
        { id: 'logo-oasis-church', name: 'Iglesia Oasis', url: '/src/img/logos/LOGO2.png' },
        { id: 'logo-oasis-icon', name: 'Oasis Icono', url: '/src/img/logos/T1.png' },
        { id: 'logo-iasd', name: 'IASD Logo', url: '/src/img/logos/IASD1.png' },
    ],
    social: [
        { id: 'social-ig', name: 'Instagram', url: '/src/img/logos/RRSSINS.png' },
        { id: 'social-fb', name: 'Facebook', url: '/src/img/logos/RRSSFB.png' },
        { id: 'social-yt', name: 'YouTube', url: '/src/img/logos/RRSSYT.png' },
        { id: 'social-x', name: 'X/Twitter', url: '/src/img/logos/RRSSX.png' },
        { id: 'social-wa', name: 'WhatsApp', url: '/src/img/logos/RRSS.png' },
    ],
    backgrounds: [
        { id: 'bg-1', name: 'Worship Lights', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=80' },
        { id: 'bg-2', name: 'Church Interior', url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&q=80' },
        { id: 'bg-3', name: 'Sunset Sky', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80' },
        { id: 'bg-4', name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
        { id: 'bg-5', name: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80' },
    ],
};

const FONTS = [
    { name: 'Arial', label: 'Arial' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Verdana', label: 'Verdana' },
    { name: 'Courier New', label: 'Courier New' },
    { name: 'Impact', label: 'Impact' },
    { name: 'MoonRising', label: 'Moon Rising' },
    { name: 'ModernAge', label: 'Modern Age' },
    { name: 'AdventSans', label: 'Advent Sans' },
];

const COLORS = [
    '#5b2ea6', '#8b5cf6', '#3b82f6', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#000000', '#ffffff', '#6b7280',
];

const GRADIENTS = [
    { label: 'Oasis Morado', value: 'linear-gradient(135deg, #5b2ea6 0%, #8b5cf6 100%)' },
    { label: 'Rosa Pasión', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { label: 'Esmeralda', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { label: 'Carbón', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
    { label: 'Cielo Azul', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
    { label: 'Oro Gala', value: 'linear-gradient(135deg, #111111 0%, #2c2c2c 100%)' },
    { label: 'Atardecer', value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
    { label: 'Menta', value: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
];

const TRANSITIONS = [
    { value: 'fade', label: 'Desvanecer' },
    { value: 'morph', label: 'Transformar' },
    { value: 'infinite', label: 'Infinito' },
    { value: 'slide', label: 'Deslizar' },
    { value: 'zoom', label: 'Zoom' },
];

const SIDEBAR_ITEMS = [
    { id: 'slides', label: 'Slides', icon: 'bi-collection' },
    { id: 'fondos', label: 'Fondos', icon: 'bi-image' },
    { id: 'elementos', label: 'Elementos', icon: 'bi-fonts' },
    { id: 'estilos', label: 'Estilos', icon: 'bi-palette2' },
];

const RIBBON_TABS = ['Inicio', 'Insertar', 'Diseño', 'Transición'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const createDefaultSlide = () => ({
    id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order: 0,
    background: '#ffffff',
    backgroundImage: '',
    gradient: 'linear-gradient(135deg, #5b2ea6 0%, #8b5cf6 100%)',
    overlayColor: '',
    overlayOpacity: 0.3,
    elements: [],
    transitionType: 'fade',
});

const transitionProps = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    morph: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 } },
    infinite: { initial: { x: -800 }, animate: { x: 0 }, exit: { x: 800 } },
    slide: { initial: { x: 800 }, animate: { x: 0 }, exit: { x: -800 } },
    zoom: { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.5, opacity: 0 } },
};

// ─── OasisPress Component ────────────────────────────────────────────────────
const OasisPress = () => {
    const [slides, setSlides] = useState([createDefaultSlide()]);
    const [selectedSlide, setSelectedSlide] = useState(0);
    const [title, setTitle] = useState('Presentación sin título');
    const [selectedElement, setSelectedElement] = useState(null);
    const [mode, setMode] = useState('classic'); // 'classic' | 'infinite'
    const [activeSidebar, setActiveSidebar] = useState('slides');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [activeRibbonTab, setActiveRibbonTab] = useState('inicio');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    const canvasRef = useRef(null);

    // ── Responsive ───────────────────────────────────────────────────────────
    React.useEffect(() => {
        const onResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // ── Slide helpers ─────────────────────────────────────────────────────────
    const addSlide = () => {
        const newSlide = createDefaultSlide();
        setSlides([...slides, newSlide]);
        setSelectedSlide(slides.length);
    };

    const deleteSlide = (idx) => {
        if (slides.length === 1) return;
        const newSlides = slides.filter((_, i) => i !== idx);
        setSlides(newSlides);
        setSelectedSlide(Math.max(0, idx - 1));
    };

    const duplicateSlide = (idx) => {
        const copy = { ...slides[idx], id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        setSlides([...slides.slice(0, idx + 1), copy, ...slides.slice(idx + 1)]);
        setSelectedSlide(idx + 1);
    };

    const updateSlide = (idx, changes) => {
        setSlides(slides.map((s, i) => i === idx ? { ...s, ...changes } : s));
    };

    // ── Element helpers ───────────────────────────────────────────────────────
    const addElement = (type, props = {}) => {
        const newEl = {
            id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: 100, y: 100, width: type === 'image' ? 120 : 240, height: type === 'image' ? 80 : 60,
            style: { fontFamily: 'Arial', fontSize: 24, color: '#ffffff', backgroundColor: 'transparent', bold: false, italic: false, underline: false, ...props },
            content: type === 'image' ? (props.url || '') : 'Texto',
        };
        setSlides(slides.map((s, i) => i === selectedSlide
            ? { ...s, elements: [...s.elements, newEl] }
            : s
        ));
        setSelectedElement(newEl.id);
    };

    const updateElement = (elId, changes) => {
        setSlides(slides.map((s, i) => {
            if (i !== selectedSlide) return s;
            return { ...s, elements: s.elements.map(el => el.id === elId ? { ...el, ...changes } : el) };
        }));
    };

    const deleteElement = (elId) => {
        setSlides(slides.map((s, i) => {
            if (i !== selectedSlide) return s;
            return { ...s, elements: s.elements.filter(el => el.id !== elId) };
        }));
        setSelectedElement(null);
    };

    // ── Export ────────────────────────────────────────────────────────────────
    const handleExportPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        if (canvasRef.current) {
            for (let i = 0; i < slides.length; i++) {
                await html2canvas(canvasRef.current).then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    doc.addImage(imgData, 'PNG', 10, 10, 190, 100);
                    if (i < slides.length - 1) doc.addPage();
                });
            }
        }
        doc.save(`${title}.pdf`);
    };

    const handleExportPPTX = async () => {
        const pptxgen = (await import('pptxgenjs')).default;
        const pptx = new pptxgen();
        slides.forEach(() => {
            const slide = pptx.addSlide();
            slide.addText(title, { x: 1, y: 1, fontSize: 24 });
        });
        pptx.writeFile({ fileName: `${title}.pptx` });
    };

    const handleFullscreen = () => {
        if (canvasRef.current) {
            const el = canvasRef.current;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.msRequestFullscreen) el.msRequestFullscreen();
        }
    };

    // ── Sidebar toggle ────────────────────────────────────────────────────────
    const openSidebar = (id) => {
        if (activeSidebar === id && !isSidebarCollapsed) {
            setIsSidebarCollapsed(true);
        } else {
            setActiveSidebar(id);
            setIsSidebarCollapsed(false);
        }
    };

    // ── Current slide ─────────────────────────────────────────────────────────
    const slide = slides[selectedSlide] || slides[0];
    const selectedEl = slide?.elements.find(e => e.id === selectedElement) || null;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    // Sidebar icon column
    const renderSidebar = () => (
        <div className="canva-sidebar d-flex flex-column align-items-center bg-dark text-white py-3 shadow-lg"
            style={{ width: '72px', zIndex: 100, flexShrink: 0 }}>
            {/* Logo */}
            <div className="mb-4 px-2">
                <img src={logoOasis} style={{ height: '30px', filter: 'brightness(10)' }} alt="Oasis" />
            </div>

            {/* Nav items */}
            {SIDEBAR_ITEMS.map(item => (
                <button
                    key={item.id}
                    onClick={() => openSidebar(item.id)}
                    title={item.label}
                    className={`nav-btn d-flex flex-column align-items-center justify-content-center border-0 mb-1 py-2 w-100 transition-all
                        ${activeSidebar === item.id && !isSidebarCollapsed ? 'active-sidebar-btn' : 'text-white-50'}`}
                    style={{ background: 'transparent', fontSize: '0.6rem' }}
                >
                    <i className={`bi ${item.icon} fs-5 mb-1`}></i>
                    <span>{item.label}</span>
                </button>
            ))}

            <div className="mt-auto">
                <button className="nav-btn border-0 py-2 w-100 text-white-50"
                    onClick={handleFullscreen} title="Pantalla completa"
                    style={{ background: 'transparent', fontSize: '0.55rem' }}>
                    <i className="bi bi-arrows-fullscreen fs-5"></i>
                </button>
            </div>
        </div>
    );

    // Collapsible side panel
    const renderPanel = () => (
        <AnimatePresence>
            {!isSidebarCollapsed && (
                <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="canva-panel bg-white shadow-lg scrollbar-custom"
                    style={{
                        position: 'fixed',
                        top: isMobile ? 'auto' : '100px',
                        left: isMobile ? 0 : '72px',
                        bottom: isMobile ? '56px' : 0,
                        width: isMobile ? '100%' : '280px',
                        zIndex: 200,
                        overflowY: 'auto',
                        borderRight: '1px solid #e9ecef',
                    }}
                >
                    {/* Panel header */}
                    <div className="p-3 d-flex justify-content-between align-items-center border-bottom sticky-top bg-white">
                        <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', color: '#5b2ea6' }}>
                            {SIDEBAR_ITEMS.find(i => i.id === activeSidebar)?.label}
                        </h6>
                        <button className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setIsSidebarCollapsed(true)} />
                    </div>

                    <div className="p-3">

                        {/* ══ SLIDES ══ */}
                        {activeSidebar === 'slides' && (
                            <div>
                                <button className="btn btn-sm btn-primary w-100 rounded-pill mb-3 fw-bold shadow-sm" onClick={addSlide}>
                                    <i className="bi bi-plus-lg me-1"></i> Nueva Diapositiva
                                </button>
                                {slides.map((sl, idx) => (
                                    <div key={sl.id}
                                        className={`mb-2 rounded-3 border cursor-pointer overflow-hidden shadow-sm ${selectedSlide === idx ? 'border-primary' : 'border-light'}`}
                                        onClick={() => setSelectedSlide(idx)}
                                        style={{ outline: selectedSlide === idx ? '2px solid #5b2ea6' : 'none' }}
                                    >
                                        {/* Mini preview */}
                                        <div style={{
                                            height: '55px',
                                            background: sl.gradient || sl.background || '#5b2ea6',
                                            backgroundImage: sl.backgroundImage ? `url(${sl.backgroundImage})` : undefined,
                                            backgroundSize: 'cover',
                                            position: 'relative',
                                        }}>
                                            <span className="position-absolute top-50 start-50 translate-middle fw-bold"
                                                style={{ color: 'white', fontSize: '0.65rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                                Slide {idx + 1}
                                            </span>
                                        </div>
                                        <div className="d-flex gap-1 p-1 bg-light">
                                            <button className="btn btn-light btn-sm py-0 px-2 flex-grow-1 hover-scale"
                                                style={{ fontSize: '0.6rem' }}
                                                onClick={e => { e.stopPropagation(); duplicateSlide(idx); }}>
                                                <i className="bi bi-copy me-1"></i>Duplicar
                                            </button>
                                            {slides.length > 1 && (
                                                <button className="btn btn-outline-danger btn-sm py-0 px-2 hover-scale"
                                                    style={{ fontSize: '0.6rem' }}
                                                    onClick={e => { e.stopPropagation(); deleteSlide(idx); }}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ══ FONDOS ══ */}
                        {activeSidebar === 'fondos' && (
                            <div>
                                {/* Gradientes */}
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Degradados</label>
                                <div className="row g-2 mb-4">
                                    {GRADIENTS.map(g => (
                                        <div key={g.value} className="col-6">
                                            <div className="rounded-3 cursor-pointer hover-scale border shadow-sm"
                                                onClick={() => updateSlide(selectedSlide, { gradient: g.value, backgroundImage: '' })}
                                                style={{
                                                    height: '50px',
                                                    background: g.value,
                                                    outline: slide.gradient === g.value ? '2px solid #5b2ea6' : 'none',
                                                }}>
                                                <div className="d-flex h-100 align-items-end justify-content-start p-1">
                                                    <span style={{ color: 'white', fontSize: '0.55rem', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{g.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Color sólido */}
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Color de fondo</label>
                                <input type="color" className="form-control form-control-color w-100 shadow-sm mb-3"
                                    style={{ height: '36px' }}
                                    value={slide.background || '#1a1a2e'}
                                    onChange={e => updateSlide(selectedSlide, { background: e.target.value, gradient: '' })} />

                                {/* Imágenes de fondo */}
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Fondos de imagen</label>
                                <div className="row g-1 mb-3">
                                    {IMAGE_LIBRARY.backgrounds.map(img => (
                                        <div key={img.id} className="col-4">
                                            <img src={img.url} alt={img.name}
                                                onClick={() => updateSlide(selectedSlide, { backgroundImage: img.url, gradient: '' })}
                                                className="img-fluid rounded-2 cursor-pointer hover-scale shadow-sm"
                                                style={{ height: '48px', width: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>

                                {/* Overlay */}
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">
                                    Color de máscara&nbsp;<span className="text-muted fw-normal">(overlay)</span>
                                </label>
                                <div className="d-flex gap-2 align-items-center mb-2">
                                    <input type="color" className="form-control form-control-color border-0 rounded"
                                        style={{ width: '32px', height: '32px' }}
                                        value={slide.overlayColor || '#000000'}
                                        onChange={e => updateSlide(selectedSlide, { overlayColor: e.target.value })} />
                                    <input type="range" className="form-range flex-grow-1"
                                        min="0" max="1" step="0.05"
                                        value={slide.overlayOpacity ?? 0.3}
                                        onChange={e => updateSlide(selectedSlide, { overlayOpacity: parseFloat(e.target.value) })} />
                                    <span className="x-small text-muted" style={{ minWidth: '30px' }}>
                                        {Math.round((slide.overlayOpacity ?? 0.3) * 100)}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ══ ELEMENTOS ══ */}
                        {activeSidebar === 'elementos' && (
                            <div>
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Agregar Texto</label>
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    <button className="btn btn-outline-primary btn-sm hover-scale"
                                        onClick={() => addElement('text', { fontFamily: 'MoonRising', fontSize: 32, color: '#ffffff' })}>
                                        <i className="bi bi-type-h1 me-1"></i>Título
                                    </button>
                                    <button className="btn btn-outline-secondary btn-sm hover-scale"
                                        onClick={() => addElement('text', { fontFamily: 'AdventSans', fontSize: 20, color: '#ffffff' })}>
                                        <i className="bi bi-type-h2 me-1"></i>Subtítulo
                                    </button>
                                    <button className="btn btn-outline-secondary btn-sm hover-scale"
                                        onClick={() => addElement('text', { fontFamily: 'Arial', fontSize: 16, color: '#ffffff' })}>
                                        <i className="bi bi-type me-1"></i>Párrafo
                                    </button>
                                </div>

                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Logos Institucionales</label>
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {IMAGE_LIBRARY.logos.map(logo => (
                                        <button key={logo.id}
                                            className="btn btn-light border rounded-3 hover-scale d-flex flex-column align-items-center p-2"
                                            style={{ width: '64px', height: '64px' }}
                                            onClick={() => addElement('image', { url: logo.url })}
                                            title={logo.name}>
                                            <img src={logo.url} alt={logo.name} style={{ height: '28px', maxWidth: '50px', objectFit: 'contain' }} />
                                            <span style={{ fontSize: '0.5rem', marginTop: '4px' }}>{logo.name.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>

                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Redes Sociales</label>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {IMAGE_LIBRARY.social.map(s => (
                                        <button key={s.id}
                                            className="btn btn-light border rounded-3 hover-scale d-flex flex-column align-items-center p-2"
                                            style={{ width: '64px', height: '64px' }}
                                            onClick={() => addElement('image', { url: s.url })}
                                            title={s.name}>
                                            <i className={`bi bi-${s.name.toLowerCase().replace('/', '-')} fs-4`}></i>
                                            <span style={{ fontSize: '0.5rem', marginTop: '4px' }}>{s.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ══ ESTILOS (propiedades del elemento seleccionado) ══ */}
                        {activeSidebar === 'estilos' && (
                            <div>
                                {!selectedEl ? (
                                    <div className="text-center text-muted py-4">
                                        <i className="bi bi-hand-index fs-1 opacity-25"></i>
                                        <p className="x-small mt-2">Selecciona un elemento en el canvas para editarlo</p>
                                    </div>
                                ) : (
                                    <div className="selected-element-panel">
                                        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                            <span className="small fw-bold text-primary text-uppercase">
                                                {selectedEl.type === 'text' ? 'Texto' : 'Imagen'}
                                            </span>
                                            <button className="btn btn-sm p-0 text-muted" onClick={() => setSelectedElement(null)}>
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>

                                        {selectedEl.type === 'text' && (
                                            <>
                                                {/* Contenido */}
                                                <label className="x-small text-muted mb-1">Texto</label>
                                                <textarea className="form-control form-control-sm mb-3" rows={2}
                                                    value={selectedEl.content}
                                                    onChange={e => updateElement(selectedEl.id, { content: e.target.value })} />

                                                {/* Fuente + Tamaño */}
                                                <div className="d-flex gap-2 mb-2">
                                                    <div className="flex-grow-1">
                                                        <label className="x-small text-muted mb-1"><i className="bi bi-fonts me-1"></i>Fuente</label>
                                                        <select className="form-select form-select-sm" style={{ fontSize: '0.7rem' }}
                                                            value={selectedEl.style.fontFamily}
                                                            onChange={e => updateElement(selectedEl.id, { style: { ...selectedEl.style, fontFamily: e.target.value } })}>
                                                            {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                                                        </select>
                                                    </div>
                                                    <div style={{ width: '68px' }}>
                                                        <label className="x-small text-muted mb-1">Tam</label>
                                                        <input type="number" className="form-control form-control-sm text-center"
                                                            value={selectedEl.style.fontSize}
                                                            onChange={e => updateElement(selectedEl.id, { style: { ...selectedEl.style, fontSize: Number(e.target.value) } })}
                                                            min={8} max={200} />
                                                    </div>
                                                </div>

                                                {/* Color */}
                                                <label className="x-small text-muted mb-1"><i className="bi bi-palette me-1"></i>Color</label>
                                                <div className="d-flex gap-1 mb-3 flex-wrap">
                                                    <input type="color" className="form-control form-control-color border-0 rounded"
                                                        style={{ width: '32px', height: '32px' }}
                                                        value={selectedEl.style.color}
                                                        onChange={e => updateElement(selectedEl.id, { style: { ...selectedEl.style, color: e.target.value } })} />
                                                    {COLORS.map(c => (
                                                        <button key={c} className="btn p-0 border rounded-1"
                                                            style={{
                                                                width: '22px', height: '22px', background: c,
                                                                outline: selectedEl.style.color === c ? '2px solid #5b2ea6' : 'none'
                                                            }}
                                                            onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, color: c } })} />
                                                    ))}
                                                </div>

                                                {/* Negrita / Itálica / Subrayado */}
                                                <label className="x-small text-muted mb-1">Formato</label>
                                                <div className="d-flex gap-2 mb-3">
                                                    {[
                                                        { key: 'bold', icon: 'bi-type-bold', label: 'N' },
                                                        { key: 'italic', icon: 'bi-type-italic', label: 'K' },
                                                        { key: 'underline', icon: 'bi-type-underline', label: 'S' },
                                                    ].map(fmt => (
                                                        <button key={fmt.key}
                                                            className={`btn btn-sm fw-bold px-3 ${selectedEl.style[fmt.key] ? 'btn-primary' : 'btn-light'}`}
                                                            onClick={() => updateElement(selectedEl.id, { style: { ...selectedEl.style, [fmt.key]: !selectedEl.style[fmt.key] } })}>
                                                            {fmt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Eliminar elemento */}
                                        <button className="btn btn-outline-danger btn-sm w-100 rounded-pill mt-2"
                                            onClick={() => deleteElement(selectedEl.id)}>
                                            <i className="bi bi-trash me-1"></i>Eliminar elemento
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Ribbon tabs
    const renderRibbon = () => (
        <div className="ribbon-container bg-white border-bottom shadow-sm flex-shrink-0" style={{ borderRadius: 0 }}>
            {/* Tab labels */}
            <div className="d-flex border-bottom bg-light px-2" style={{ gap: '2px' }}>
                {RIBBON_TABS.map(tab => (
                    <button key={tab}
                        onClick={() => setActiveRibbonTab(tab.toLowerCase())}
                        style={{
                            border: 'none',
                            background: activeRibbonTab === tab.toLowerCase() ? '#fff' : 'transparent',
                            borderBottom: activeRibbonTab === tab.toLowerCase() ? '3px solid #5b2ea6' : 'none',
                            padding: '6px 18px',
                            fontSize: '0.85rem',
                            fontWeight: activeRibbonTab === tab.toLowerCase() ? 'bold' : 'normal',
                            color: activeRibbonTab === tab.toLowerCase() ? '#5b2ea6' : '#666',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                        }}>
                        {tab}
                    </button>
                ))}

                {/* Acciones derechas */}
                <div className="ms-auto d-flex align-items-center gap-2 px-3">
                    <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}
                        onClick={handleExportPDF}>
                        <i className="bi bi-file-earmark-pdf me-1"></i>PDF
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}
                        onClick={handleExportPPTX}>
                        <i className="bi bi-file-earmark-slides me-1"></i>PPTX
                    </button>
                </div>
            </div>

            {/* Ribbon content */}
            <div className="px-3 py-2 bg-white d-flex align-items-center gap-4 flex-wrap" style={{ minHeight: '58px' }}>

                {/* ── INICIO ── */}
                {activeRibbonTab === 'inicio' && (
                    <>
                        {/* Modo */}
                        <div className="d-flex flex-column align-items-center px-3 border-end">
                            <div className="d-flex gap-1 mb-1">
                                {[
                                    { id: 'classic', label: 'Clásico', icon: 'bi-layout-text-window' },
                                    { id: 'infinite', label: 'Infinito', icon: 'bi-infinity' },
                                ].map(m => (
                                    <button key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`btn btn-sm d-flex flex-column align-items-center py-1 px-2 ${mode === m.id ? 'btn-primary' : 'btn-light'}`}
                                        style={{ fontSize: '0.65rem' }}>
                                        <i className={`bi ${m.icon} fs-5 mb-1`}></i>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Modo</span>
                        </div>

                        {/* Diapositivas */}
                        <div className="d-flex flex-column align-items-center px-3 border-end">
                            <div className="d-flex gap-1 mb-1">
                                <button className="btn btn-sm btn-light py-1 px-2 hover-scale" onClick={addSlide}
                                    style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-plus-lg me-1"></i>Nueva
                                </button>
                                <button className="btn btn-sm btn-light py-1 px-2 hover-scale" onClick={() => duplicateSlide(selectedSlide)}
                                    style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-copy me-1"></i>Duplicar
                                </button>
                                {slides.length > 1 && (
                                    <button className="btn btn-sm btn-outline-danger py-1 px-2 hover-scale" onClick={() => deleteSlide(selectedSlide)}
                                        style={{ fontSize: '0.7rem' }}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                )}
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Diapositiva {selectedSlide + 1} / {slides.length}</span>
                        </div>

                        {/* Navegación */}
                        <div className="d-flex flex-column align-items-center px-3 border-end">
                            <div className="d-flex gap-1 mb-1">
                                <button className="btn btn-sm btn-light py-1 px-3 hover-scale"
                                    disabled={selectedSlide === 0}
                                    onClick={() => setSelectedSlide(s => Math.max(0, s - 1))}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <button className="btn btn-sm btn-light py-1 px-3 hover-scale"
                                    disabled={selectedSlide === slides.length - 1}
                                    onClick={() => setSelectedSlide(s => Math.min(slides.length - 1, s + 1))}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Navegar</span>
                        </div>
                    </>
                )}

                {/* ── INSERTAR ── */}
                {activeRibbonTab === 'insertar' && (
                    <>
                        <div className="d-flex flex-column align-items-center px-3 border-end">
                            <div className="d-flex gap-1 mb-1">
                                <button className="btn btn-sm btn-light py-1 px-2 hover-scale"
                                    onClick={() => addElement('text', { fontFamily: 'MoonRising', fontSize: 32, color: '#ffffff' })}
                                    style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-type-h1 me-1"></i>Título
                                </button>
                                <button className="btn btn-sm btn-light py-1 px-2 hover-scale"
                                    onClick={() => addElement('text', { fontFamily: 'Arial', fontSize: 18, color: '#ffffff' })}
                                    style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-type me-1"></i>Texto
                                </button>
                                <button className="btn btn-sm btn-light py-1 px-2 hover-scale"
                                    onClick={() => addElement('image', { url: IMAGE_LIBRARY.logos[0].url })}
                                    style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-image me-1"></i>Logo Oasis
                                </button>
                                <button className="btn btn-sm btn-light py-1 px-2 hover-scale"
                                    onClick={() => addElement('image', { url: IMAGE_LIBRARY.logos[3].url })}
                                    style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-image me-1"></i>Logo IASD
                                </button>
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Insertar</span>
                        </div>

                        <div className="d-flex flex-column align-items-center px-3">
                            <div className="d-flex gap-1 mb-1">
                                {IMAGE_LIBRARY.social.slice(0, 3).map(s => (
                                    <button key={s.id} className="btn btn-sm btn-light py-1 px-2 hover-scale"
                                        onClick={() => addElement('image', { url: s.url })}
                                        title={s.name}
                                        style={{ fontSize: '0.7rem' }}>
                                        <i className={`bi bi-${s.name.toLowerCase().replace('/', '-')}`}></i>
                                    </button>
                                ))}
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Redes Sociales</span>
                        </div>
                    </>
                )}

                {/* ── DISEÑO ── */}
                {activeRibbonTab === 'diseño' && (
                    <>
                        <div className="d-flex flex-column align-items-center px-3 border-end">
                            <div className="d-flex gap-1 mb-1 flex-wrap">
                                {GRADIENTS.slice(0, 5).map(g => (
                                    <button key={g.value}
                                        onClick={() => updateSlide(selectedSlide, { gradient: g.value, backgroundImage: '' })}
                                        title={g.label}
                                        style={{
                                            width: 28, height: 28, background: g.value,
                                            border: slide.gradient === g.value ? '2px solid #5b2ea6' : '1px solid #ddd',
                                            borderRadius: '4px', cursor: 'pointer',
                                        }} />
                                ))}
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Degradado</span>
                        </div>

                        <div className="d-flex flex-column align-items-center px-3 border-end">
                            <div className="mb-1">
                                <input type="color" className="form-control form-control-color p-0"
                                    style={{ width: 28, height: 28, border: '2px solid #ddd', borderRadius: '4px' }}
                                    value={slide.background || '#1a1a2e'}
                                    onChange={e => updateSlide(selectedSlide, { background: e.target.value, gradient: '' })} />
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Color</span>
                        </div>

                        <div className="d-flex flex-column align-items-center px-3">
                            <div className="d-flex gap-1 mb-1 align-items-center">
                                <input type="color" className="form-control form-control-color p-0"
                                    style={{ width: 28, height: 28, border: '2px solid #ddd', borderRadius: '4px' }}
                                    value={slide.overlayColor || '#000000'}
                                    onChange={e => updateSlide(selectedSlide, { overlayColor: e.target.value })} />
                                <input type="range" style={{ width: '80px' }}
                                    className="form-range"
                                    min="0" max="1" step="0.05"
                                    value={slide.overlayOpacity ?? 0.3}
                                    onChange={e => updateSlide(selectedSlide, { overlayOpacity: parseFloat(e.target.value) })} />
                                <span style={{ fontSize: '0.65rem', color: '#666' }}>
                                    {Math.round((slide.overlayOpacity ?? 0.3) * 100)}%
                                </span>
                            </div>
                            <span className="x-small text-muted fw-bold text-uppercase">Máscara</span>
                        </div>
                    </>
                )}

                {/* ── TRANSICIÓN ── */}
                {activeRibbonTab === 'transición' && (
                    <div className="d-flex flex-column align-items-center px-3">
                        <div className="d-flex gap-1 mb-1">
                            {TRANSITIONS.map(t => (
                                <button key={t.value}
                                    className={`btn btn-sm py-1 px-2 hover-scale ${slide.transitionType === t.value ? 'btn-primary' : 'btn-light'}`}
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={() => updateSlide(selectedSlide, { transitionType: t.value })}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <span className="x-small text-muted fw-bold text-uppercase">Tipo de Transición</span>
                    </div>
                )}

            </div>
        </div>
    );

    // ── Canvas de la diapositiva ───────────────────────────────────────────────
    const renderCanvas = () => {
        const bgStyle = slide.backgroundImage
            ? { backgroundImage: `url(${slide.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : slide.gradient
                ? { background: slide.gradient }
                : { background: slide.background || '#1a1a2e' };

        return (
            <div className="canva-workspace d-flex align-items-center justify-content-center flex-grow-1 overflow-hidden"
                style={{ background: '#e5e5e5', backgroundImage: 'radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id + slide.transitionType}
                        ref={canvasRef}
                        initial={transitionProps[slide.transitionType]?.initial}
                        animate={transitionProps[slide.transitionType]?.animate}
                        exit={transitionProps[slide.transitionType]?.exit}
                        transition={{ duration: 0.6 }}
                        className="position-relative overflow-hidden"
                        style={{
                            width: '760px',
                            height: '427px',
                            maxWidth: '90vw',
                            maxHeight: '70vh',
                            borderRadius: '4px',
                            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4), 0 18px 36px -18px rgba(0,0,0,0.5)',
                            ...bgStyle,
                        }}
                        onClick={() => setSelectedElement(null)}
                    >
                        {/* Overlay de color/máscara */}
                        {slide.overlayColor && (
                            <div style={{
                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                background: slide.overlayColor,
                                opacity: slide.overlayOpacity ?? 0.3,
                            }} />
                        )}

                        {/* Gradient overlay para imagen */}
                        {slide.backgroundImage && (
                            <div style={{
                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.6) 100%)',
                            }} />
                        )}

                        {/* Elementos */}
                        {slide.elements.map(el => (
                            el.type === 'image' ? (
                                <img
                                    key={el.id}
                                    src={el.content}
                                    alt="img"
                                    onClick={e => { e.stopPropagation(); setSelectedElement(el.id); openSidebar('estilos'); }}
                                    style={{
                                        position: 'absolute',
                                        left: el.x, top: el.y,
                                        width: el.width, height: el.height,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        outline: selectedElement === el.id ? '2px dashed #00d3df' : 'none',
                                        outlineOffset: '4px',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                                    }}
                                />
                            ) : (
                                <div
                                    key={el.id}
                                    onClick={e => { e.stopPropagation(); setSelectedElement(el.id); openSidebar('estilos'); }}
                                    style={{
                                        position: 'absolute',
                                        left: el.x, top: el.y,
                                        width: el.width,
                                        cursor: 'pointer',
                                        outline: selectedElement === el.id ? '2px dashed #00d3df' : 'none',
                                        outlineOffset: '4px',
                                        borderRadius: '4px',
                                        padding: '2px 4px',
                                        background: el.style.backgroundColor !== 'transparent' ? el.style.backgroundColor : undefined,
                                    }}>
                                    <span style={{
                                        fontFamily: el.style.fontFamily,
                                        fontSize: el.style.fontSize,
                                        color: el.style.color,
                                        fontWeight: el.style.bold ? 'bold' : 'normal',
                                        fontStyle: el.style.italic ? 'italic' : 'normal',
                                        textDecoration: el.style.underline ? 'underline' : 'none',
                                        textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                        display: 'block',
                                        userSelect: 'none',
                                    }}>
                                        {el.content || 'Texto'}
                                    </span>
                                </div>
                            )
                        ))}

                        {/* Hint cuando está vacío */}
                        {slide.elements.length === 0 && (
                            <div className="position-absolute top-50 start-50 translate-middle text-center"
                                style={{ color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>
                                <i className="bi bi-cursor-fill fs-1 d-block mb-2"></i>
                                <span style={{ fontSize: '0.75rem' }}>Usa el Ribbon o el Panel lateral para agregar elementos</span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RETURN
    // ─────────────────────────────────────────────────────────────────────────
    if (mode === 'infinite') {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div className="bg-dark text-white d-flex align-items-center gap-3 px-4 py-2 shadow-sm" style={{ flexShrink: 0 }}>
                    <img src={logoOasis} style={{ height: '28px', filter: 'brightness(10)' }} alt="Oasis" />
                    <span className="fw-bold" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>OasisPress</span>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        className="flex-grow-1 bg-transparent border-0 text-white fw-semibold"
                        style={{ outline: 'none', fontSize: '0.9rem' }} />
                    <button className="btn btn-sm btn-outline-light" onClick={() => setMode('classic')}>
                        <i className="bi bi-grid-3x3-gap me-1"></i>Modo Clásico
                    </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <OasisInfiniteEngine initialSlides={slides} />
                </div>
            </div>
        );
    }

    return (
        <div className="canva-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ── Header ── */}
            <div className="bg-dark text-white d-flex align-items-center gap-3 px-4 py-2 shadow"
                style={{ flexShrink: 0, zIndex: 300 }}>
                <img src={logoOasis} style={{ height: '28px', filter: 'brightness(10)' }} alt="Oasis" />
                <span className="fw-bold" style={{ color: '#a78bfa', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    OasisPress
                </span>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="flex-grow-1 bg-transparent border-0 text-white"
                    style={{ outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                    placeholder="Presentación sin título..."
                />
                <button className="btn btn-sm btn-outline-light" style={{ fontSize: '0.75rem' }} onClick={handleExportPDF}>
                    <i className="bi bi-file-earmark-pdf me-1"></i>PDF
                </button>
                <button className="btn btn-sm btn-outline-light" style={{ fontSize: '0.75rem' }} onClick={handleExportPPTX}>
                    <i className="bi bi-file-earmark-slides me-1"></i>PPTX
                </button>
            </div>

            {/* ── Ribbon ── */}
            {renderRibbon()}

            {/* ── Body: sidebar + panel + workspace ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

                {/* Sidebar icons */}
                {renderSidebar()}

                {/* Collapsible panel (fixed overlay) */}
                {renderPanel()}

                {/* Main workspace */}
                {renderCanvas()}

            </div>

            {/* ─── Inline styles ─── */}
            <style>{`
                .x-small { font-size: 0.7rem; }
                .cursor-pointer { cursor: pointer; }
                .hover-scale { transition: transform 0.15s ease, box-shadow 0.15s ease; }
                .hover-scale:hover { transform: scale(1.05); }

                .scrollbar-custom::-webkit-scrollbar { width: 5px; }
                .scrollbar-custom::-webkit-scrollbar-track { background: #f1f1f1; }
                .scrollbar-custom::-webkit-scrollbar-thumb { background: #bbb; border-radius: 10px; }

                .canva-sidebar .nav-btn { cursor: pointer; transition: background 0.2s, color 0.2s; }
                .canva-sidebar .nav-btn:hover { background: rgba(255,255,255,0.08) !important; color: white !important; }

                .active-sidebar-btn {
                    background: rgba(0,211,223,0.18) !important;
                    color: #00d3df !important;
                    border-left: 3px solid #00d3df !important;
                }

                .btn-primary { background-color: #5b2ea6 !important; border-color: #5b2ea6 !important; }
                .btn-primary:hover { background-color: #4a2487 !important; }
                .text-primary { color: #5b2ea6 !important; }

                /* Responsive — mobile: sidebar pasa a barra inferior */
                @media (max-width: 991px) {
                    .canva-sidebar {
                        position: fixed !important;
                        bottom: 0; left: 0;
                        width: 100% !important;
                        height: 56px !important;
                        flex-direction: row !important;
                        padding: 0 !important;
                        justify-content: space-around !important;
                        border-right: none !important;
                        border-top: 1px solid rgba(255,255,255,0.12);
                        z-index: 200 !important;
                    }
                    .canva-sidebar .nav-btn {
                        height: 100% !important;
                        margin: 0 !important;
                        font-size: 0.5rem !important;
                        padding: 4px 0 !important;
                    }
                    .canva-workspace { padding-bottom: 56px; }
                    .active-sidebar-btn { border-left: none !important; border-top: 3px solid #00d3df !important; }
                }

                /* Ribbon para mobile: scroll horizontal */
                @media (max-width: 768px) {
                    .ribbon-container .d-flex.flex-wrap {
                        overflow-x: auto !important;
                        flex-wrap: nowrap !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default OasisPress;
