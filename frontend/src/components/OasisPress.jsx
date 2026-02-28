import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import OasisInfiniteEngine from './OasisInfiniteEngine';

// ─── Assets locales ─────────────────────────────────────────────────────────
import logoOasis from '../img/logos/LOGO1.png';
import logoIasd from '../img/logos/IASD1.png';
import rrssImg from '../img/logos/RRSS1.png';

// ─── Configuración de fuentes ─────────────────────────────────────────────
const FONTS = [
    { name: 'MoonRising', label: 'Moon Rising' },
    { name: 'ModernAge', label: 'Modern Age' },
    { name: 'AdventSans', label: 'Advent Sans' },
    { name: 'above-the-beyond-script', label: 'Script' },
    { name: 'Arial', label: 'Arial' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Impact', label: 'Impact' },
];

// ─── Colores rápidos ─────────────────────────────────────────────────────────
const QUICK_COLORS = ['#ffffff', '#f3f3f3', '#000000', '#5b2ea6', '#8b5cf6', '#f59e0b', '#ef4444'];

// ─── Degradados ──────────────────────────────────────────────────────────────
const GRADIENTS = [
    { label: 'Oasis', value: 'linear-gradient(135deg,#5b2ea6,#8b5cf6)' },
    { label: 'Noche', value: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
    { label: 'Fuego', value: 'linear-gradient(135deg,#f093fb,#f5576c)' },
    { label: 'Bosque', value: 'linear-gradient(135deg,#11998e,#38ef7d)' },
    { label: 'Carbón', value: 'linear-gradient(135deg,#232526,#414345)' },
    { label: 'Cielo', value: 'linear-gradient(135deg,#00c6ff,#0072ff)' },
    { label: 'Oro', value: 'linear-gradient(135deg,#111111,#2c2c2c)' },
    { label: 'Atardecer', value: 'linear-gradient(135deg,#f7971e,#ffd200)' },
];

// ─── Stock backgrounds Unsplash ──────────────────────────────────────────────
const BG_IMAGES = [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=70',
    'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=70',
    'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=70',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=70',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=70',
];

// ─── Logos inseribles ────────────────────────────────────────────────────────
const LOGO_ASSETS = [
    { id: 'oasis', label: 'Oasis', url: '/src/img/logos/LOGO1.png' },
    { id: 'iasd', label: 'IASD', url: '/src/img/logos/IASD1.png' },
    { id: 'icon', label: 'Icono', url: '/src/img/logos/T1.png' },
    { id: 'rrss', label: 'Redes', url: '/src/img/logos/RRSS1.png' },
];

// ─── Transiciones ────────────────────────────────────────────────────────────
const TRANSITION_OPTS = [
    { value: 'fade', label: 'Desvanecer' },
    { value: 'slide', label: 'Deslizar' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'morph', label: 'Transformar' },
];

const TRANS_PROPS = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    slide: { initial: { x: 600 }, animate: { x: 0 }, exit: { x: -600 } },
    zoom: { initial: { scale: 0.6, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.6, opacity: 0 } },
    morph: { initial: { scale: 0.85, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.85, opacity: 0 } },
};

// ─── Slide factory ────────────────────────────────────────────────────────────
let _sid = 0;
const mkSlide = () => ({
    id: `sl-${Date.now()}-${++_sid}`,
    gradient: GRADIENTS[0].value,
    bgColor: '#1a1a2e',
    bgImage: '',
    overlayColor: '#000000',
    overlayOp: 0.35,
    elements: [],
    transition: 'fade',
});

// ─── Element factory ──────────────────────────────────────────────────────────
const mkEl = (type, extra = {}) => ({
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    x: 80, y: 80,
    width: type === 'image' ? 110 : 260,
    height: type === 'image' ? 80 : 60,
    content: type === 'image' ? (extra.url || '') : 'Texto',
    style: {
        fontFamily: 'MoonRising',
        fontSize: 28,
        color: '#ffffff',
        bgColor: 'transparent',
        bold: false,
        italic: false,
        underline: false,
        ...extra,
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
const OasisPress = () => {
    const [slides, setSlides] = useState([mkSlide()]);
    const [curIdx, setCurIdx] = useState(0);
    const [tab, setTab] = useState('inicio');        // ribbon tab
    const [selEl, setSelEl] = useState(null);            // selected element id
    const [mode, setMode] = useState('classic');        // classic | infinite
    const [presTitle, setPresTitle] = useState('Presentación sin título');
    const [showPanel, setShowPanel] = useState('');              // '' | 'bg-images' | 'gradients'
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const canvasRef = useRef(null);

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);

    // ── Shortcuts ─────────────────────────────────────────────────────────────
    const slide = slides[curIdx] ?? slides[0];
    const el = slide?.elements.find(e => e.id === selEl) ?? null;

    const setSlide = (changes) => setSlides(s => s.map((sl, i) => i === curIdx ? { ...sl, ...changes } : sl));
    const setEl = (changes) => {
        setSlides(s => s.map((sl, i) => i !== curIdx ? sl : {
            ...sl,
            elements: sl.elements.map(e => e.id === selEl ? { ...e, ...changes } : e),
        }));
    };
    const setElStyle = (changes) => setEl({ style: { ...el.style, ...changes } });

    // ── Slide ops ─────────────────────────────────────────────────────────────
    const addSlide = () => {
        const ns = mkSlide();
        setSlides(s => [...s, ns]);
        setCurIdx(slides.length);
        setSelEl(null);
    };

    const duplicateSlide = (idx) => {
        const copy = {
            ...slides[idx],
            id: `sl-${Date.now()}-${++_sid}`,
            elements: slides[idx].elements.map(e => ({ ...e, id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
        };
        const ns = [...slides.slice(0, idx + 1), copy, ...slides.slice(idx + 1)];
        setSlides(ns);
        setCurIdx(idx + 1);
    };

    const deleteSlide = (idx) => {
        if (slides.length === 1) return;
        const ns = slides.filter((_, i) => i !== idx);
        setSlides(ns);
        setCurIdx(Math.max(0, idx - 1));
        setSelEl(null);
    };

    // ── Element ops ────────────────────────────────────────────────────────────
    const addEl = (type, extra = {}) => {
        const e = mkEl(type, extra);
        setSlides(s => s.map((sl, i) => i !== curIdx ? sl : { ...sl, elements: [...sl.elements, e] }));
        setSelEl(e.id);
    };

    const deleteEl = (id) => {
        setSlides(s => s.map((sl, i) => i !== curIdx ? sl : { ...sl, elements: sl.elements.filter(e => e.id !== id) }));
        setSelEl(null);
    };

    // ── Export ─────────────────────────────────────────────────────────────────
    const exportPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        if (canvasRef.current) {
            const c = await html2canvas(canvasRef.current);
            doc.addImage(c.toDataURL('image/png'), 'PNG', 10, 10, 190, 107);
        }
        doc.save(`${presTitle}.pdf`);
    };

    const exportPPTX = async () => {
        const pptxgen = (await import('pptxgenjs')).default;
        const pptx = new pptxgen();
        slides.forEach(() => { const s = pptx.addSlide(); s.addText(presTitle, { x: 1, y: 1, fontSize: 24 }); });
        pptx.writeFile({ fileName: `${presTitle}.pptx` });
    };

    const fullscreen = () => {
        const el = canvasRef.current;
        if (!el) return;
        (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
    };

    // ── Slide background style ─────────────────────────────────────────────────
    const slideBg = (sl) => sl.bgImage
        ? { backgroundImage: `url(${sl.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : sl.gradient
            ? { background: sl.gradient }
            : { background: sl.bgColor || '#1a1a2e' };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER: LEFT THUMBNAIL PANEL
    // ─────────────────────────────────────────────────────────────────────────
    const renderThumbnails = () => (
        <div style={{
            width: isMobile ? '100%' : '200px',
            flexShrink: 0,
            background: '#f1f3f5',
            borderRight: '1px solid #dee2e6',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '10px 8px',
            gap: '8px',
        }} className="scrollbar-custom">

            {/* Botón nueva diapositiva */}
            <button
                onClick={addSlide}
                className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                style={{ background: '#5b2ea6', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '0.75rem', padding: '7px 0' }}
            >
                <i className="bi bi-plus-lg"></i> Nueva diapositiva
            </button>

            {/* Miniaturas */}
            {slides.map((sl, idx) => (
                <div
                    key={sl.id}
                    onClick={() => { setCurIdx(idx); setSelEl(null); }}
                    style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        outline: curIdx === idx ? '2px solid #5b2ea6' : '2px solid transparent',
                        boxShadow: curIdx === idx ? '0 0 0 1px #5b2ea6' : '0 1px 4px rgba(0,0,0,0.15)',
                        position: 'relative',
                        flexShrink: 0,
                    }}
                >
                    {/* Mini canvas */}
                    <div style={{
                        height: '112px',
                        ...slideBg(sl),
                        position: 'relative',
                    }}>
                        {sl.overlayColor && (
                            <div style={{ position: 'absolute', inset: 0, background: sl.overlayColor, opacity: sl.overlayOp, pointerEvents: 'none' }} />
                        )}
                        {/* Texto preview de elementos */}
                        {sl.elements.filter(e => e.type === 'text').slice(0, 2).map((e, i) => (
                            <div key={e.id} style={{
                                position: 'absolute', left: '5%', right: '5%',
                                top: i === 0 ? '30%' : '55%',
                                textAlign: 'center', overflow: 'hidden',
                                color: e.style.color,
                                fontFamily: e.style.fontFamily,
                                fontSize: '8px',
                                fontWeight: e.style.bold ? 'bold' : 'normal',
                                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            }}>
                                {e.content}
                            </div>
                        ))}
                        {/* Imágenes preview */}
                        {sl.elements.filter(e => e.type === 'image').slice(0, 2).map(e => (
                            <img key={e.id} src={e.content} alt="" style={{
                                position: 'absolute', right: '4px', top: '4px',
                                height: '18px', objectFit: 'contain',
                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                            }} />
                        ))}
                    </div>

                    {/* Footer de la miniatura */}
                    <div style={{ background: '#fff', padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 600 }}>Slide {idx + 1}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <button
                                title="Duplicar"
                                onClick={e => { e.stopPropagation(); duplicateSlide(idx); }}
                                style={{ border: 'none', background: 'transparent', padding: '1px 4px', cursor: 'pointer', color: '#5b2ea6', fontSize: '0.7rem' }}
                            >
                                <i className="bi bi-copy"></i>
                            </button>
                            {slides.length > 1 && (
                                <button
                                    title="Eliminar"
                                    onClick={e => { e.stopPropagation(); deleteSlide(idx); }}
                                    style={{ border: 'none', background: 'transparent', padding: '1px 4px', cursor: 'pointer', color: '#dc3545', fontSize: '0.7rem' }}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER: RIBBON
    // ─────────────────────────────────────────────────────────────────────────
    const renderRibbon = () => {
        // Helpers para el elemento seleccionado
        const fontSizeUp = () => el && setElStyle({ fontSize: Math.min(200, (el.style.fontSize || 24) + 2) });
        const fontSizeDown = () => el && setElStyle({ fontSize: Math.max(8, (el.style.fontSize || 24) - 2) });

        return (
            <div className="ribbon-container" style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #dee2e6' }}>

                {/* ── Tab bar ── */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', padding: '0 12px', alignItems: 'center' }}>
                    {['Inicio', 'Insertar', 'Diseño', 'Transición'].map(t => (
                        <button key={t}
                            onClick={() => setTab(t.toLowerCase())}
                            style={{
                                border: 'none',
                                borderBottom: tab === t.toLowerCase() ? '3px solid #5b2ea6' : '3px solid transparent',
                                background: 'transparent',
                                padding: '7px 18px',
                                fontSize: '0.85rem',
                                fontWeight: tab === t.toLowerCase() ? 700 : 400,
                                color: tab === t.toLowerCase() ? '#5b2ea6' : '#555',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >{t}</button>
                    ))}

                    {/* Acciones derecha */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }} onClick={exportPDF}>
                            <i className="bi bi-file-earmark-pdf me-1"></i>PDF
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }} onClick={exportPPTX}>
                            <i className="bi bi-file-earmark-slides me-1"></i>PPTX
                        </button>
                        <button className="btn btn-sm" style={{ fontSize: '0.75rem', background: '#5b2ea6', color: '#fff', borderRadius: '6px', border: 'none', padding: '5px 18px', fontWeight: 600 }} onClick={fullscreen}>
                            <i className="bi bi-arrows-fullscreen me-1"></i>Pantalla
                        </button>
                    </div>
                </div>

                {/* ── Controls row ── */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', minHeight: '58px', gap: '0', overflowX: 'auto', flexWrap: 'nowrap' }}>

                    {/* ══ INICIO ══ */}
                    {tab === 'inicio' && (
                        <>
                            {/* Grupo: Elemento activo */}
                            <div className="ribbon-group border-end">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: '120px', fontSize: '0.78rem', height: '28px', padding: '0 6px' }}
                                        value={selEl || ''}
                                        onChange={e => setSelEl(e.target.value || null)}
                                    >
                                        <option value="">— Elemento —</option>
                                        {slide.elements.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.type === 'text' ? `✏ ${(e.content || '').slice(0, 14)}…` : `🖼 Imagen`}
                                            </option>
                                        ))}
                                    </select>
                                    {el && (
                                        <button className="btn btn-sm btn-outline-danger py-0 px-2"
                                            style={{ height: '28px', fontSize: '0.7rem' }}
                                            onClick={() => deleteEl(selEl)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="ribbon-label">Elemento</div>
                            </div>

                            {/* Grupo: Tamaño de fuente */}
                            {el?.type === 'text' && (
                                <div className="ribbon-group border-end">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <button className="btn btn-sm btn-light py-0 px-2" style={{ height: '28px' }} onClick={fontSizeDown}>
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <span style={{ minWidth: '38px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, background: '#f8f9fa', borderRadius: '4px', padding: '3px 4px', border: '1px solid #dee2e6' }}>
                                            {el.style.fontSize}
                                        </span>
                                        <button className="btn btn-sm btn-light py-0 px-2" style={{ height: '28px' }} onClick={fontSizeUp}>
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                    <div className="ribbon-label">Tamaño</div>
                                </div>
                            )}

                            {/* Grupo: Color */}
                            {el?.type === 'text' && (
                                <div className="ribbon-group border-end">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <input type="color"
                                            className="form-control form-control-color p-0"
                                            style={{ width: '28px', height: '28px', border: '2px solid #dee2e6', borderRadius: '4px', cursor: 'pointer' }}
                                            value={el.style.color}
                                            onChange={e => setElStyle({ color: e.target.value })}
                                        />
                                        {QUICK_COLORS.map(c => (
                                            <button key={c}
                                                onClick={() => setElStyle({ color: c })}
                                                style={{
                                                    width: '22px', height: '22px', background: c, borderRadius: '4px', cursor: 'pointer',
                                                    border: el.style.color === c ? '2px solid #5b2ea6' : '1px solid #ccc',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="ribbon-label">Color</div>
                                </div>
                            )}

                            {/* Grupo: Formato texto */}
                            {el?.type === 'text' && (
                                <div className="ribbon-group border-end">
                                    <div style={{ display: 'flex', gap: '3px' }}>
                                        {[
                                            { key: 'bold', label: '<b>N</b>', icon: 'bi-type-bold' },
                                            { key: 'italic', label: '<i>K</i>', icon: 'bi-type-italic' },
                                            { key: 'underline', label: '<u>S</u>', icon: 'bi-type-underline' },
                                        ].map(f => (
                                            <button key={f.key}
                                                className={`btn btn-sm py-0 px-2 ${el.style[f.key] ? 'btn-primary' : 'btn-light'}`}
                                                style={{ height: '28px', fontSize: '0.8rem' }}
                                                onClick={() => setElStyle({ [f.key]: !el.style[f.key] })}
                                            >
                                                <i className={`bi ${f.icon}`}></i>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="ribbon-label">Formato</div>
                                </div>
                            )}

                            {/* Grupo: Fuente */}
                            {el?.type === 'text' && (
                                <div className="ribbon-group border-end">
                                    <select className="form-select form-select-sm"
                                        style={{ width: '130px', fontSize: '0.72rem', height: '28px', padding: '0 6px' }}
                                        value={el.style.fontFamily}
                                        onChange={e => setElStyle({ fontFamily: e.target.value })}
                                    >
                                        {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                                    </select>
                                    <div className="ribbon-label">Fuente</div>
                                </div>
                            )}

                            {/* Grupo: Edit texto */}
                            {el?.type === 'text' && (
                                <div className="ribbon-group">
                                    <input
                                        className="form-control form-control-sm"
                                        style={{ width: '180px', fontSize: '0.78rem', height: '28px' }}
                                        value={el.content}
                                        onChange={e => setEl({ content: e.target.value })}
                                        placeholder="Texto del elemento…"
                                    />
                                    <div className="ribbon-label">Contenido</div>
                                </div>
                            )}

                            {/* Si no hay elemento seleccionado */}
                            {!el && (
                                <div style={{ color: '#aaa', fontSize: '0.75rem', paddingLeft: '12px', fontStyle: 'italic' }}>
                                    <i className="bi bi-hand-index me-1"></i>
                                    Selecciona un elemento en el canvas o inserta uno desde la pestaña <strong>Insertar</strong>
                                </div>
                            )}
                        </>
                    )}

                    {/* ══ INSERTAR ══ */}
                    {tab === 'insertar' && (
                        <>
                            <div className="ribbon-group border-end">
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn btn-sm btn-outline-primary hover-scale"
                                        style={{ fontSize: '0.72rem', height: '32px' }}
                                        onClick={() => addEl('text', { fontFamily: 'MoonRising', fontSize: 34, color: '#ffffff' })}>
                                        <i className="bi bi-type-h1 me-1"></i>Título
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary hover-scale"
                                        style={{ fontSize: '0.72rem', height: '32px' }}
                                        onClick={() => addEl('text', { fontFamily: 'AdventSans', fontSize: 20, color: '#ffffff' })}>
                                        <i className="bi bi-type-h2 me-1"></i>Subtítulo
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary hover-scale"
                                        style={{ fontSize: '0.72rem', height: '32px' }}
                                        onClick={() => addEl('text', { fontFamily: 'Arial', fontSize: 14, color: '#ffffff' })}>
                                        <i className="bi bi-type me-1"></i>Párrafo
                                    </button>
                                </div>
                                <div className="ribbon-label">Texto</div>
                            </div>

                            <div className="ribbon-group border-end">
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {LOGO_ASSETS.map(logo => (
                                        <button key={logo.id}
                                            title={logo.label}
                                            className="btn btn-sm btn-light hover-scale d-flex flex-column align-items-center"
                                            style={{ width: '50px', height: '50px', fontSize: '0.55rem', padding: '4px', gap: '2px', border: '1px solid #dee2e6' }}
                                            onClick={() => addEl('image', { url: logo.url })}>
                                            <img src={logo.url} alt={logo.label} style={{ height: '22px', objectFit: 'contain', maxWidth: '42px' }} />
                                            {logo.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="ribbon-label">Logos</div>
                            </div>

                            <div className="ribbon-group">
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {['bi-instagram', 'bi-facebook', 'bi-youtube', 'bi-whatsapp', 'bi-twitter-x'].map(ic => (
                                        <button key={ic}
                                            className="btn btn-sm btn-light hover-scale"
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => addEl('text', { fontFamily: 'Arial', fontSize: 14, color: '#ffffff', content: ic.replace('bi-', '').toUpperCase() })}>
                                            <i className={`bi ${ic}`}></i>
                                        </button>
                                    ))}
                                </div>
                                <div className="ribbon-label">Redes</div>
                            </div>
                        </>
                    )}

                    {/* ══ DISEÑO ══ */}
                    {tab === 'diseño' && (
                        <>
                            {/* Degradados */}
                            <div className="ribbon-group border-end">
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '220px' }}>
                                    {GRADIENTS.map(g => (
                                        <button key={g.value}
                                            title={g.label}
                                            onClick={() => setSlide({ gradient: g.value, bgImage: '' })}
                                            style={{
                                                width: '28px', height: '28px', background: g.value,
                                                borderRadius: '4px', cursor: 'pointer',
                                                border: slide.gradient === g.value ? '2px solid #5b2ea6' : '1px solid #ddd',
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="ribbon-label">Degradado</div>
                            </div>

                            {/* Color sólido */}
                            <div className="ribbon-group border-end">
                                <input type="color"
                                    className="form-control form-control-color p-0"
                                    style={{ width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer' }}
                                    value={slide.bgColor || '#1a1a2e'}
                                    onChange={e => setSlide({ bgColor: e.target.value, gradient: '', bgImage: '' })}
                                />
                                <div className="ribbon-label">Color</div>
                            </div>

                            {/* Imagen de fondo */}
                            <div className="ribbon-group border-end">
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    {BG_IMAGES.map((url, i) => (
                                        <div key={i}
                                            onClick={() => setSlide({ bgImage: url, gradient: '' })}
                                            style={{
                                                width: '40px', height: '32px', borderRadius: '4px', cursor: 'pointer',
                                                backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                                border: slide.bgImage === url ? '2px solid #5b2ea6' : '1px solid #ddd',
                                                transition: 'transform 0.15s',
                                            }}
                                            className="hover-scale"
                                        />
                                    ))}
                                    {slide.bgImage && (
                                        <button className="btn btn-sm btn-outline-danger py-0 px-1"
                                            style={{ height: '32px', fontSize: '0.65rem' }}
                                            onClick={() => setSlide({ bgImage: '' })}>
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="ribbon-label">Imagen de fondo</div>
                            </div>

                            {/* Overlay */}
                            <div className="ribbon-group">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input type="color"
                                        className="form-control form-control-color p-0"
                                        style={{ width: '28px', height: '28px', borderRadius: '4px' }}
                                        value={slide.overlayColor || '#000000'}
                                        onChange={e => setSlide({ overlayColor: e.target.value })}
                                    />
                                    <input type="range"
                                        style={{ width: '90px' }}
                                        className="form-range"
                                        min="0" max="1" step="0.05"
                                        value={slide.overlayOp ?? 0.35}
                                        onChange={e => setSlide({ overlayOp: parseFloat(e.target.value) })}
                                    />
                                    <span style={{ fontSize: '0.7rem', color: '#666', minWidth: '30px' }}>
                                        {Math.round((slide.overlayOp ?? 0.35) * 100)}%
                                    </span>
                                </div>
                                <div className="ribbon-label">Máscara</div>
                            </div>
                        </>
                    )}

                    {/* ══ TRANSICIÓN ══ */}
                    {tab === 'transición' && (
                        <div className="ribbon-group">
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {TRANSITION_OPTS.map(t => (
                                    <button key={t.value}
                                        className={`btn btn-sm hover-scale ${slide.transition === t.value ? 'btn-primary' : 'btn-light'}`}
                                        style={{ fontSize: '0.75rem', height: '32px' }}
                                        onClick={() => setSlide({ transition: t.value })}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <div className="ribbon-label">Tipo de Transición</div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER: CANVAS
    // ─────────────────────────────────────────────────────────────────────────
    const renderCanvas = () => {
        const tp = TRANS_PROPS[slide.transition] || TRANS_PROPS.fade;
        const bgStyle = slideBg(slide);

        return (
            <div style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e2e2e2',
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }}
                onClick={() => setSelEl(null)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id + slide.transition}
                        ref={canvasRef}
                        initial={tp.initial}
                        animate={tp.animate}
                        exit={tp.exit}
                        transition={{ duration: 0.55 }}
                        style={{
                            width: '760px',
                            height: '427px',
                            maxWidth: '88vw',
                            maxHeight: '70vh',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '4px',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.2)',
                            ...bgStyle,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Overlay */}
                        {slide.overlayColor && (
                            <div style={{ position: 'absolute', inset: 0, background: slide.overlayColor, opacity: slide.overlayOp ?? 0.35, pointerEvents: 'none' }} />
                        )}
                        {/* Gradient-over-image subtlety */}
                        {slide.bgImage && (
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />
                        )}

                        {/* Elementos */}
                        {slide.elements.map(e => (
                            e.type === 'image' ? (
                                <img
                                    key={e.id}
                                    src={e.content}
                                    alt="img"
                                    onClick={ev => { ev.stopPropagation(); setSelEl(e.id); setTab('inicio'); }}
                                    style={{
                                        position: 'absolute', left: e.x, top: e.y,
                                        width: e.width, height: e.height,
                                        objectFit: 'contain',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        outline: selEl === e.id ? '2px dashed #00d3df' : 'none',
                                        outlineOffset: '3px',
                                        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                                    }}
                                />
                            ) : (
                                <div
                                    key={e.id}
                                    onClick={ev => { ev.stopPropagation(); setSelEl(e.id); setTab('inicio'); }}
                                    style={{
                                        position: 'absolute', left: e.x, top: e.y, width: e.width,
                                        cursor: 'pointer',
                                        outline: selEl === e.id ? '2px dashed #00d3df' : 'none',
                                        outlineOffset: '3px',
                                        borderRadius: '4px',
                                        padding: '2px 4px',
                                    }}
                                >
                                    <span style={{
                                        fontFamily: e.style.fontFamily,
                                        fontSize: e.style.fontSize,
                                        color: e.style.color,
                                        fontWeight: e.style.bold ? 'bold' : 'normal',
                                        fontStyle: e.style.italic ? 'italic' : 'normal',
                                        textDecoration: e.style.underline ? 'underline' : 'none',
                                        textShadow: '0 2px 8px rgba(0,0,0,0.45)',
                                        display: 'block',
                                        userSelect: 'none',
                                        whiteSpace: 'pre-wrap',
                                    }}>
                                        {e.content || 'Texto'}
                                    </span>
                                </div>
                            )
                        ))}

                        {/* Hint vacío */}
                        {slide.elements.length === 0 && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'column', gap: '8px',
                                color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                                textAlign: 'center',
                            }}>
                                <i className="bi bi-cursor fs-1"></i>
                                <span style={{ fontSize: '0.75rem' }}>
                                    Usa <strong>Insertar</strong> en el ribbon para agregar elementos
                                </span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Modo Infinito
    // ─────────────────────────────────────────────────────────────────────────
    if (mode === 'infinite') {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#1e1e2e', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', flexShrink: 0 }}>
                    <img src={logoOasis} style={{ height: '28px', filter: 'brightness(10)' }} alt="Oasis" />
                    <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>OasisPress</span>
                    <input value={presTitle} onChange={e => setPresTitle(e.target.value)}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }} />
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

    // ─────────────────────────────────────────────────────────────────────────
    // LAYOUT PRINCIPAL
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ── HEADER ── */}
            <div style={{ background: '#1e1e2e', color: '#fff', display: 'flex', alignItems: 'center', gap: '14px', padding: '7px 16px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', zIndex: 100 }}>
                <img src={logoOasis} style={{ height: '28px', filter: 'brightness(10)' }} alt="Oasis" />
                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1.5px' }}>OasisPress</span>
                <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)' }} />
                <input
                    value={presTitle}
                    onChange={e => setPresTitle(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }}
                    placeholder="Título de la presentación…"
                />
                {/* Modo toggle */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[{ id: 'classic', label: 'Clásico' }, { id: 'infinite', label: 'Infinito' }].map(m => (
                        <button key={m.id}
                            onClick={() => setMode(m.id)}
                            style={{
                                border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                background: mode === m.id ? '#5b2ea6' : 'rgba(255,255,255,0.1)',
                                color: '#fff',
                            }}>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── RIBBON ── */}
            {renderRibbon()}

            {/* ── BODY: thumbnail panel + canvas ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {!isMobile && renderThumbnails()}
                {renderCanvas()}
            </div>

            {/* Mobile: thumbnail bar bottom */}
            {isMobile && (
                <div style={{ height: '90px', overflowX: 'auto', display: 'flex', gap: '6px', padding: '6px 8px', background: '#f1f3f5', borderTop: '1px solid #dee2e6', flexShrink: 0 }}>
                    {slides.map((sl, idx) => (
                        <div key={sl.id}
                            onClick={() => { setCurIdx(idx); setSelEl(null); }}
                            style={{
                                minWidth: '80px', height: '75px', borderRadius: '6px', overflow: 'hidden',
                                ...slideBg(sl),
                                border: curIdx === idx ? '2px solid #5b2ea6' : '2px solid transparent',
                                cursor: 'pointer', flexShrink: 0, position: 'relative',
                            }}>
                            <span style={{ position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center', fontSize: '0.55rem', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                {idx + 1}
                            </span>
                        </div>
                    ))}
                    <button onClick={addSlide}
                        style={{ minWidth: '50px', height: '75px', borderRadius: '6px', border: '2px dashed #5b2ea6', background: 'transparent', color: '#5b2ea6', fontSize: '1.4rem', cursor: 'pointer', flexShrink: 0 }}>
                        <i className="bi bi-plus-lg"></i>
                    </button>
                </div>
            )}

            {/* ── Inline styles ── */}
            <style>{`
                .ribbon-group {
                    display: flex; flex-direction: column; align-items: center;
                    padding: 0 14px; gap: 3px;
                }
                .ribbon-label {
                    font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
                    color: #888; letter-spacing: 0.5px; margin-top: 2px;
                    white-space: nowrap;
                }
                .hover-scale { transition: transform 0.13s ease; }
                .hover-scale:hover { transform: scale(1.06); }
                .scrollbar-custom::-webkit-scrollbar { width: 5px; }
                .scrollbar-custom::-webkit-scrollbar-track { background: #f1f3f5; }
                .scrollbar-custom::-webkit-scrollbar-thumb { background: #bbb; border-radius: 10px; }
                .btn-primary { background-color: #5b2ea6 !important; border-color: #5b2ea6 !important; }
                .btn-primary:hover { background-color: #4922a0 !important; }
                #preview-container:fullscreen {
                    width: 100vw !important; height: 100vh !important;
                    max-width: none !important; border-radius: 0 !important;
                    background: #000 !important;
                    display: flex !important; align-items: center !important; justify-content: center !important;
                }
                @media (max-width: 767px) {
                    .ribbon-group { padding: 0 8px; }
                    .ribbon-container .d-flex { overflow-x: auto; flex-wrap: nowrap; }
                }
            `}</style>
        </div>
    );
};

export default OasisPress;
