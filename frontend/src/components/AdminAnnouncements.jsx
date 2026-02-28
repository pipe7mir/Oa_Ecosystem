import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../react-ui/styles/theme';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';  // API client for backend requests
import { uploadCanvasToCloudinary } from '../api/cloudinary';  // Cloudinary upload
import OasisPress from './OasisPress';  // Presentation editor

// Logo assets
import logoOasis from '../img/logos/LOGO1.png';
import logoAdventista from '../img/logos/IASD1.png';
import rrssImage from '../img/logos/RRSS1.png';

/* ─────────────────────────────────────────────────
   Format presets
 ───────────────────────────────────────────────────*/
const FORMATS = {
    instagram: { label: 'Instagram', icon: 'bi-instagram', W: 1080, H: 1350, aspect: '4/5', desc: 'Vertical 4:5' },
    square: { label: 'Cuadrado', icon: 'bi-square', W: 1080, H: 1080, aspect: '1/1', desc: 'Cuadrado 1:1' },
    youtube: { label: 'YouTube', icon: 'bi-youtube', W: 1920, H: 1080, aspect: '16/9', desc: 'Horizontal 16:9' },
    whatsapp: { label: 'WhatsApp', icon: 'bi-whatsapp', W: 720, H: 1280, aspect: '9/16', desc: 'Estado 9:16' },
};

/* ─────────────────────────────────────────────────
   Helpers
 ───────────────────────────────────────────────────*/
const toBase64 = async (url) => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((res) => {
            const r = new FileReader();
            r.onloadend = () => res(r.result);
            r.readAsDataURL(blob);
        });
    } catch { return null; }
};

const loadImg = (src) => new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

const STOCK_CATEGORIES = {
    'Religión & Fe': [
        'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80',
        'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80',
        'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80',
        'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80',
        'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80',
        'https://images.unsplash.com/photo-1499209974431-2761e25236d0?w=800&q=80',
    ],
    'Naturaleza': [
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    ],
    'Cielo & Atardecer': [
        'https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    ],
};

const FONTS = [
    { value: 'ModernAge', label: 'Modern Age (Logo)' },
    { value: 'MoonRising', label: 'Moon Rising (Título)' },
    { value: 'AdventSans', label: 'Advent Sans' },
    { value: 'above-the-beyond-script', label: 'Script (Orador)' },
    { value: 'Arial', label: 'Arial (Sencilla)' },
];

const PosControl = ({ label, pos, onChange }) => (
    <div className="p-2 bg-white rounded-3 shadow-sm mb-2 border" style={{ fontSize: '0.65rem' }}>
        <div className="fw-bold text-muted text-uppercase mb-1">{label} - Posición (X / Y)</div>
        <div className="row gx-3">
            <div className="col-6">
                <div className="d-flex justify-content-between text-muted mb-1"><span>Horizontal</span><span>{Math.round(pos.x)}px</span></div>
                <input type="range" className="form-range form-range-sm" min="-400" max="400" value={pos.x} onChange={e => onChange({ ...pos, x: parseInt(e.target.value) })} />
            </div>
            <div className="col-6">
                <div className="d-flex justify-content-between text-muted mb-1"><span>Vertical</span><span>{Math.round(pos.y)}px</span></div>
                <input type="range" className="form-range form-range-sm" min="-600" max="600" value={pos.y} onChange={e => onChange({ ...pos, y: parseInt(e.target.value) })} />
            </div>
        </div>
    </div>
);

const FontPreloader = () => (
    <div style={{ opacity: 0, position: 'absolute', height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        <span style={{ fontFamily: 'ModernAge', fontWeight: 'normal' }}>Oasis</span>
        <span style={{ fontFamily: 'MoonRising', fontWeight: 'normal' }}>Oasis</span>
        <span style={{ fontFamily: 'AdventSans', fontWeight: 'normal' }}>Oasis</span>
        <span style={{ fontFamily: 'above-the-beyond-script', fontWeight: 'normal' }}>Oasis</span>
    </div>
);

/* ─────────────────────────────────────────────────
   Templates DNA
 ───────────────────────────────────────────────────*/
const TEMPLATES = [
    {
        id: 'oasis-classic',
        name: 'Oasis Classic',
        desc: 'Centrado y Equilibrado',
        color: '#1a1a2e',
        gradientStart: '#1a1a2e', gradientEnd: '#16213e',
        titleFont: 'MoonRising', titleColor: '#ffffff', titleSize: 2.2,
        title2Size: 1.4,
        speakerFont: 'above-the-beyond-script', speakerColor: '#ffffff', speakerSize: 1.8,
        dateFont: 'AdventSans', timeFont: 'AdventSans', location: 'TEMPLO OASIS',
        tagSize: 0.5,
    },
    {
        id: 'impact-left',
        name: 'Impacto Lateral',
        desc: 'Asimétrico y Moderno',
        color: '#2d0a3d',
        gradientStart: '#2d0a3d', gradientEnd: '#1a0521',
        tag: 'EVENTO', tagBgColor: '#ff0055', tagColor: '#ffffff', tagFont: 'ModernAge', tagSize: 0.6,
        titleFont: 'ModernAge', titleColor: '#ffffff', titleSize: 2.5,
        title2Font: 'ModernAge', title2Color: '#ff0055', title2Size: 1.5,
        speakerFont: 'above-the-beyond-script', speakerColor: '#ffffff', speakerSize: 1.6,
        dateFont: 'AdventSans', timeFont: 'AdventSans',
    },
    {
        id: 'gold-gala',
        name: 'Lujo Gala',
        desc: 'Elegancia en Negro y Oro',
        color: '#000000',
        gradientStart: '#111111', gradientEnd: '#000000',
        tag: 'GALA', tagBgColor: '#c5a021', tagColor: '#000000', tagFont: 'ModernAge', tagSize: 0.5,
        titleFont: 'MoonRising', titleColor: '#c5a021', titleSize: 2.2,
        title2Font: 'MoonRising', title2Color: '#ffffff', title2Size: 1.3,
        speakerFont: 'above-the-beyond-script', speakerColor: '#ffffff', speakerSize: 1.8,
        dateFont: 'MoonRising', timeFont: 'MoonRising',
    },
    {
        id: 'minimal-top',
        name: 'Zen Minimal',
        desc: 'Limpio y Arriba',
        color: '#f8f9fa',
        gradientStart: '#ffffff', gradientEnd: '#e9ecef',
        tag: 'INFO', tagBgColor: '#333333', tagColor: '#ffffff', tagFont: 'AdventSans', tagSize: 0.4,
        titleFont: 'AdventSans', titleColor: '#333333', titleSize: 1.8,
        title2Font: 'AdventSans', title2Color: '#777777', title2Size: 1.2,
        speakerFont: 'ModernAge', speakerColor: '#333333', speakerSize: 1.5,
        dateFont: 'AdventSans', timeFont: 'AdventSans',
    },
    {
        id: 'neon-pulse',
        name: 'Neon Pulse',
        desc: 'Energía y Web3 Style',
        color: '#000000',
        gradientStart: '#000000', gradientEnd: '#001a1a',
        tag: 'LIVE', tagBgColor: '#00f2ff', tagColor: '#000000', tagFont: 'ModernAge', tagSize: 0.7,
        titleFont: 'AdventSans', titleColor: '#00f2ff', titleSize: 2.8,
        title2Font: 'ModernAge', title2Color: '#ffffff', title2Size: 1.8,
        speakerFont: 'above-the-beyond-script', speakerColor: '#ffffff', speakerSize: 2.0,
        dateFont: 'AdventSans', timeFont: 'AdventSans',
    },
    {
        id: 'traditional',
        name: 'Tradicional',
        desc: 'Clásico, solemne y equilibrado',
        color: '#2c3e50',
        gradientStart: '#2c3e50', gradientEnd: '#34495e',
        tag: 'SERVICIO', tagBgColor: '#8e44ad', tagColor: '#ffffff', tagFont: 'Playfair Display', tagSize: 0.5,
        titleFont: 'Playfair Display', titleColor: '#ecf0f1', titleSize: 2.2,
        title2Font: 'Montserrat', title2Color: '#bdc3c7', title2Size: 1.4,
        speakerFont: 'Montserrat', speakerColor: '#ecf0f1', speakerSize: 1.6,
        dateFont: 'Montserrat', timeFont: 'Montserrat', location: 'Iglesia Central',
    },
    {
        id: 'modern',
        name: 'Moderno',
        desc: 'Líneas limpias, tipografía sans‑serif',
        color: '#1abc9c',
        gradientStart: '#1abc9c', gradientEnd: '#16a085',
        tag: 'ACTO', tagBgColor: '#27ae60', tagColor: '#ffffff', tagFont: 'Montserrat', tagSize: 0.5,
        titleFont: 'Montserrat', titleColor: '#ffffff', titleSize: 2.2,
        title2Font: 'Montserrat', title2Color: '#ecf0f1', title2Size: 1.4,
        speakerFont: 'Montserrat', speakerColor: '#ffffff', speakerSize: 1.6,
        dateFont: 'Montserrat', timeFont: 'Montserrat',
    },
    {
        id: 'event',
        name: 'Evento',
        desc: 'Diseño dinámico para conciertos y conferencias',
        color: '#e74c3c',
        gradientStart: '#e74c3c', gradientEnd: '#c0392b',
        tag: 'EVENTO', tagBgColor: '#d35400', tagColor: '#ffffff', tagFont: 'Great Vibes', tagSize: 0.6,
        titleFont: 'Great Vibes', titleColor: '#f1c40f', titleSize: 2.5,
        title2Font: 'Montserrat', title2Color: '#ecf0f1', title2Size: 1.5,
        speakerFont: 'Montserrat', speakerColor: '#f1c40f', speakerSize: 1.8,
        dateFont: 'Montserrat', timeFont: 'Montserrat',
    },
    {
        id: 'youth',
        name: 'Juventud',
        desc: 'Vibrante, colores vivos y tipografía juvenil',
        color: '#9b59b6',
        gradientStart: '#9b59b6', gradientEnd: '#8e44ad',
        tag: 'JUVENIL', tagBgColor: '#f1c40f', tagColor: '#2c3e50', tagFont: 'Montserrat', tagSize: 0.5,
        titleFont: 'Montserrat', titleColor: '#ffffff', titleSize: 2.2,
        title2Font: 'Montserrat', title2Color: '#ecf0f1', title2Size: 1.4,
        speakerFont: 'Montserrat', speakerColor: '#ffffff', speakerSize: 1.7,
        dateFont: 'Montserrat', timeFont: 'Montserrat',
    },
    {
        id: 'communion',
        name: 'Comunión',
        desc: 'Tonos cálidos, tipografía elegante para sacramentos',
        color: '#d35400',
        gradientStart: '#d35400', gradientEnd: '#e67e22',
        tag: 'COMUNIÓN', tagBgColor: '#c0392b', tagColor: '#ffffff', tagFont: 'Playfair Display', tagSize: 0.5,
        titleFont: 'Playfair Display', titleColor: '#fdfefe', titleSize: 2.4,
        title2Font: 'Montserrat', title2Color: '#fdfefe', title2Size: 1.5,
        speakerFont: 'Montserrat', speakerColor: '#fdfefe', speakerSize: 1.8,
        dateFont: 'Montserrat', timeFont: 'Montserrat', location: 'Capilla del Santo',
    }
];

const SIDEBAR_ITEMS = [
    { id: 'design', label: 'Diseño', icon: 'bi-palette2' },
    { id: 'media', label: 'Medios', icon: 'bi-images' },
    { id: 'text', label: 'Texto', icon: 'bi-fonts' },
    { id: 'brand', label: 'Marca', icon: 'bi-shield-check' },
];

/* ─────────────────────────────────────────────────
   CLOCK PICKER MODAL — Reloj analógico AM/PM
──────────────────────────────────────────────────*/
const ClockPickerModal = ({ value, onChange, onClose }) => {
    const parseTime = () => {
        if (!value) return { h: 12, m: 0, ampm: 'AM' };
        const [hh, mm] = value.split(':').map(Number);
        return { h: hh % 12 || 12, m: mm || 0, ampm: hh >= 12 ? 'PM' : 'AM' };
    };
    const { h, m, ampm } = parseTime();
    const toRad = (deg) => (deg - 90) * Math.PI / 180;
    const cx = 80, cy = 80, r = 70;
    const hAngle = ((h % 12) / 12) * 360 + (m / 60) * 30;
    const mAngle = (m / 60) * 360;
    const hx = cx + r * 0.55 * Math.cos(toRad(hAngle));
    const hy = cy + r * 0.55 * Math.sin(toRad(hAngle));
    const mx = cx + r * 0.85 * Math.cos(toRad(mAngle));
    const my = cy + r * 0.85 * Math.sin(toRad(mAngle));
    const setTime = (newH, newM, newAmpm) => {
        const h24 = newAmpm === 'PM' ? (newH === 12 ? 12 : newH + 12) : (newH === 12 ? 0 : newH);
        onChange(`${String(h24).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
    };
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', width: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <h6 style={{ margin: 0, fontWeight: 700, color: '#1f1f2e', fontSize: '0.95rem' }}>Seleccionar Hora</h6>
                <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
                    {Array.from({ length: 60 }, (_, i) => {
                        const a = toRad(i * 6); const ri = 70, ro = i % 5 === 0 ? 58 : 64;
                        return <line key={i} x1={cx + ri * Math.cos(a)} y1={cy + ri * Math.sin(a)} x2={cx + ro * Math.cos(a)} y2={cy + ro * Math.sin(a)} stroke={i % 5 === 0 ? '#94a3b8' : '#e2e8f0'} strokeWidth={i % 5 === 0 ? 1.5 : 0.8} />;
                    })}
                    {Array.from({ length: 12 }, (_, i) => {
                        const num = i === 0 ? 12 : i;
                        const a = toRad(i * 30);
                        return <text key={i} x={cx + 50 * Math.cos(a)} y={cy + 50 * Math.sin(a) + 4} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600">{num}</text>;
                    })}
                    <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#5b2ea6" strokeWidth="2" strokeLinecap="round" />
                    <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#1f1f2e" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx={cx} cy={cy} r="4.5" fill="#5b2ea6" />
                </svg>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="number" min="1" max="12" value={h}
                        onChange={e => setTime(Math.max(1, Math.min(12, parseInt(e.target.value) || 12)), m, ampm)}
                        style={{ width: '52px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, border: '2px solid #e2e8f0', borderRadius: '8px', padding: '6px 4px' }} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#5b2ea6' }}>:</span>
                    <input type="number" min="0" max="59" value={String(m).padStart(2, '0')}
                        onChange={e => setTime(h, Math.max(0, Math.min(59, parseInt(e.target.value) || 0)), ampm)}
                        style={{ width: '52px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, border: '2px solid #e2e8f0', borderRadius: '8px', padding: '6px 4px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {['AM', 'PM'].map(p => (
                            <button key={p} onClick={() => setTime(h, m, p)}
                                style={{ padding: '4px 10px', borderRadius: '8px', border: `2px solid ${ampm === p ? '#5b2ea6' : '#e2e8f0'}`, background: ampm === p ? '#5b2ea6' : '#f8f9fa', color: ampm === p ? '#fff' : '#555', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={onClose} style={{ background: '#5b2ea6', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', width: '100%', fontSize: '0.9rem' }}>
                    ✓ Aceptar
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   CALENDAR PICKER MODAL — Calendario mensual
──────────────────────────────────────────────────*/
const CalendarPickerModal = ({ value, onChange, onClose }) => {
    const today = new Date();
    const selected = value ? new Date(value + 'T12:00') : today;
    const [calYear, setCalYear] = useState(selected.getFullYear());
    const [calMonth, setCalMonth] = useState(selected.getMonth());
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
    const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    const prevMonth = () => calMonth === 0 ? (setCalYear(y => y - 1), setCalMonth(11)) : setCalMonth(m => m - 1);
    const nextMonth = () => calMonth === 11 ? (setCalYear(y => y + 1), setCalMonth(0)) : setCalMonth(m => m + 1);
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', width: '290px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h6 style={{ margin: 0, fontWeight: 700, color: '#1f1f2e', textAlign: 'center', fontSize: '0.95rem' }}>Seleccionar Fecha</h6>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={prevMonth} style={{ border: 'none', background: '#ede9fe', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, color: '#5b2ea6' }}>‹</button>
                    <span style={{ fontWeight: 700, color: '#1f1f2e', fontSize: '0.95rem' }}>{MONTHS[calMonth]} {calYear}</span>
                    <button onClick={nextMonth} style={{ border: 'none', background: '#ede9fe', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, color: '#5b2ea6' }}>›</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                    {DAYS.map(d => <span key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, padding: '3px 0' }}>{d}</span>)}
                    {cells.map((d, i) => {
                        if (!d) return <span key={`e${i}`} />;
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const isSel = value === dateStr;
                        const isTd = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
                        return (
                            <button key={d} onClick={() => onChange(dateStr)}
                                style={{ border: `2px solid ${isSel ? '#5b2ea6' : isTd ? '#c4b5fd' : 'transparent'}`, borderRadius: '8px', background: isSel ? '#5b2ea6' : 'transparent', color: isSel ? '#fff' : '#1f1f2e', fontWeight: isSel || isTd ? 700 : 400, padding: '5px 2px', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center' }}>
                                {d}
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} style={{ background: '#5b2ea6', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                    ✓ Aceptar
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   Main Component
 ───────────────────────────────────────────────────*/
const AdminAnnouncements = () => {
    const [activeMode, setActiveMode] = useState('anuncios'); // 'anuncios' | 'presentaciones'
    const [announcements, setAnnouncements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState('design');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [activeAdvTab, setActiveAdvTab] = useState('pos'); // pos, style, brand
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [assets, setAssets] = useState({ oasis: null, iasd: null, rrss: null });
    const [showLibrary, setShowLibrary] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [activeRibbonTab, setActiveRibbonTab] = useState('inicio');
    // Picker modals
    const [showClockPicker, setShowClockPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTagEditor, setShowTagEditor] = useState(false);
    const [shapeMode, setShapeMode] = useState(false); // listening for click on canvas to place shape
    const [editingElement, setEditingElement] = useState(null); // which element is being inline-edited
    const [editingValue, setEditingValue] = useState('');

    // Handle responsive breakpoints
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const DEFAULTS = {
        id: '', title: '', title2: '', title3: '', speaker: '', content: '', tag: 'GALA', date: '', time: '',
        format: 'instagram',
        bgMode: 'gradient',
        bgImage: null,
        bgPosX: 50,
        bgPosY: 50,
        gradientStart: '#1a1a2e',
        gradientEnd: '#16213e',
        blendGradient: false,
        blendOpacity: 0.5,
        bgOpacity: 0.55,
        showLogoOasis: true,
        showLogoIasd: false,
        showRrss: false,
        logoOasisSize: 40,
        logoIasdSize: 30,
        rrssSize: 28,
        customLogos: [], // Array of {name, url}
        titlePos: { x: 0, y: 108 },
        title2Pos: { x: 0, y: 104 },
        title3Pos: { x: 0, y: 100 },
        speakerPos: { x: 0, y: 100 },
        tagPos: { x: 0, y: 51 },
        datePos: { x: 0, y: 0 },
        timePos: { x: 0, y: 0 },
        locationPos: { x: 0, y: 0 },
        contentPos: { x: 0, y: 0 },
        rrssPos: { x: 0, y: 0 },
        location: 'TEMPLO OASIS',
        locationSize: 1,
        titleSize: 2,
        title2Size: 1.5,
        title3Size: 1.2,
        speakerSize: 1.7,
        contentSize: 1.8,
        tagSize: 0.5,
        dateSize: 1,
        timeSize: 1,
        tagStyle: 'pill-translucent',
        contentStyle: 'normal',
        contentPattern: 'none', // none, dots, grain, lines
        contentBgOpacity: 0.15,
        titleFont: 'MoonRising',
        title2Font: 'ModernAge',
        title3Font: 'AdventSans',
        speakerFont: 'above-the-beyond-script',
        contentFont: 'ModernAge',
        tagFont: 'AdventSans',
        dateFont: 'AdventSans',
        timeFont: 'AdventSans',
        locationFont: 'AdventSans',
        // Colors with opacity
        titleColor: '#ffffff',
        title2Color: '#ffffff',
        title3Color: '#ffffff',
        speakerColor: '#ffffff',
        tagColor: '#ffffff',
        tagBgColor: '#5b2ea6',
        tagBorderColor: '#ffffff',
        dateColor: '#ffffff',
        timeColor: '#ffffff',
        locationColor: '#ffffff',
        // Opacity per element (0-100)
        titleOpacity: 100,
        title2Opacity: 100,
        title3Opacity: 100,
        speakerOpacity: 100,
        tagOpacity: 100,
        dateOpacity: 100,
        timeOpacity: 100,
        locationOpacity: 100,
    };

    const [formData, setFormData] = useState(DEFAULTS);
    const [imageFile, setImageFile] = useState(null);
    const [fontsReady, setFontsReady] = useState(false);

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
    const setMany = (obj) => setFormData(prev => ({ ...prev, ...obj }));

    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const previewRef = useRef(null);
    const dragState = useRef({ active: false, startX: 0, startY: 0, startPosX: 50, startPosY: 50 });

    // Refs for draggables
    const titleRef = useRef(null);
    const title2Ref = useRef(null);
    const title3Ref = useRef(null);
    const speakerRef = useRef(null);
    const contentRef = useRef(null);
    const tagRef = useRef(null);
    const dateRef = useRef(null);
    const timeRef = useRef(null);
    const locationRef = useRef(null);
    const rrssRef = useRef(null);

    useEffect(() => {
        (async () => {
            const [oasis, iasd, rrss] = await Promise.all([
                toBase64(logoOasis), toBase64(logoAdventista), toBase64(rrssImage),
            ]);
            setAssets({ oasis, iasd, rrss });
        })();
        fetchAnnouncements();

        // Ensure fonts are loaded
        if (document.fonts) {
            document.fonts.ready.then(() => {
                setFontsReady(true); // Set fontsReady to true once fonts are loaded
                // Force a small update to refresh preview
                setFormData(prev => ({ ...prev }));
            });
        } else {
            setFontsReady(true); // If document.fonts is not supported, assume fonts are ready
        }
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await apiClient.get('/announcements');
            setAnnouncements(Array.isArray(data) ? data : []);
        }
        catch (e) { console.error(e); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) { alert('La imagen no debe superar 8 MB'); return; }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setMany({ bgImage: reader.result, bgMode: 'image', bgPosX: 50, bgPosY: 50 });
        reader.readAsDataURL(file);
    };

    const handleSelectStock = async (url) => {
        setShowLibrary(false);
        setMany({ bgMode: 'image', bgImage: url, bgPosX: 50, bgPosY: 50 });
        const b64 = await toBase64(url);
        if (b64) setMany({ bgImage: b64 });
    };

    const onDragStart = useCallback((e) => {
        if (formData.bgMode !== 'image' || !formData.bgImage) return;
        if (e.target.closest('.react-draggable')) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragState.current = { active: true, startX: clientX, startY: clientY, startPosX: formData.bgPosX, startPosY: formData.bgPosY };
    }, [formData.bgMode, formData.bgImage, formData.bgPosX, formData.bgPosY]);

    const onDragMove = useCallback((e) => {
        if (!dragState.current.active) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const container = previewRef.current;
        if (!container) return;
        const { width, height } = container.getBoundingClientRect();
        const dx = ((clientX - dragState.current.startX) / width) * -80;
        const dy = ((clientY - dragState.current.startY) / height) * -80;
        const newX = Math.max(0, Math.min(100, dragState.current.startPosX + dx));
        const newY = Math.max(0, Math.min(100, dragState.current.startPosY + dy));
        setMany({ bgPosX: newX, bgPosY: newY });
    }, []);

    const onDragEnd = useCallback(() => { dragState.current.active = false; }, []);

    useEffect(() => {
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('touchend', onDragEnd);
        return () => {
            window.removeEventListener('mousemove', onDragMove);
            window.removeEventListener('mouseup', onDragEnd);
            window.removeEventListener('touchmove', onDragMove);
            window.removeEventListener('touchend', onDragEnd);
        };
    }, [onDragMove, onDragEnd]);

    /* ─── Inline text editing handler ─── */
    const EDITABLE_FIELDS = {
        title: 'title', title2: 'title2', title3: 'title3',
        speaker: 'speaker', tag: 'tag', content: 'content', location: 'location',
    };
    const handleElementDoubleClick = (id) => {
        const field = EDITABLE_FIELDS[id];
        if (!field) return; // logos are not text-editable
        setEditingElement(id);
        setEditingValue(formData[field] || '');
        setSelectedElementId(id);
    };
    const commitEdit = () => {
        if (editingElement && EDITABLE_FIELDS[editingElement]) {
            set(EDITABLE_FIELDS[editingElement], editingValue);
        }
        setEditingElement(null);
    };

    /* ─── Selected element quick-edit field key ─── */
    const selectedFieldKey = selectedElementId && EDITABLE_FIELDS[selectedElementId] ? EDITABLE_FIELDS[selectedElementId] : null;

    const handleFullscreen = () => {
        if (previewRef.current) {
            const el = previewRef.current;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.msRequestFullscreen) el.msRequestFullscreen();
        }
    };

    const handleDownload = async () => {
        try {
            const canvas = await composeCanvas();
            const link = document.createElement('a');
            link.download = `oasis-design-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (err) {
            console.error("Download failed:", err);
            alert("Error al descargar la imagen.");
        }
    };

    const composeCanvas = async () => {
        const canvas = document.createElement('canvas');
        const fmt = FORMATS[formData.format] || FORMATS.instagram;
        const pH = previewRef.current.offsetHeight;
        const W = 1080, H = (pH > 0) ? Math.round((W * pH) / previewRef.current.offsetWidth) : 1350;
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Robust Font Wait
        if (document.fonts) {
            await document.fonts.ready;
            await new Promise(r => setTimeout(r, 80)); // Browser sync buffer
        }

        // Background
        if (formData.bgMode === 'image' && formData.bgImage) {
            try {
                const bgImg = await loadImg(formData.bgImage);
                const scale = Math.max(W / bgImg.width, H / bgImg.height);
                const dw = bgImg.width * scale, dh = bgImg.height * scale;
                const ox = ((formData.bgPosX / 100) * (W - dw));
                const oy = ((formData.bgPosY / 100) * (H - dh));
                ctx.drawImage(bgImg, ox, oy, dw, dh);

                // Overlay gradient if enabled
                if (formData.blendGradient) {
                    const g = ctx.createLinearGradient(0, 0, W, H);
                    g.addColorStop(0, formData.gradientStart); g.addColorStop(1, formData.gradientEnd);
                    ctx.save();
                    ctx.globalAlpha = formData.blendOpacity;
                    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
                    ctx.restore();
                }
            } catch {
                const g = ctx.createLinearGradient(0, 0, W, H);
                g.addColorStop(0, formData.gradientStart); g.addColorStop(1, formData.gradientEnd);
                ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
            }
        } else {
            const g = ctx.createLinearGradient(0, 0, W, H);
            g.addColorStop(0, formData.gradientStart); g.addColorStop(1, formData.gradientEnd);
            ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }

        ctx.fillStyle = `rgba(0,0,0,${formData.bgOpacity})`;
        ctx.fillRect(0, 0, W, H);

        const container = previewRef.current;
        const pRect = container.getBoundingClientRect();
        const pW = pRect.width, pHeight = pRect.height;
        const scaleFactor = H / pHeight;

        const getFs = (ref) => {
            if (!ref.current) return 24;
            const child = ref.current.firstElementChild;
            const target = (child && child.style.fontSize) ? child : ref.current;
            return parseFloat(window.getComputedStyle(target).fontSize) * scaleFactor;
        };

        const getRelPos = (ref) => {
            if (!ref.current) return null;
            const r = ref.current.getBoundingClientRect();
            return {
                x: ((r.left - pRect.left) / pW) * W,
                y: ((r.top - pRect.top) / pHeight) * H,
                w: (r.width / pW) * W,
                h: (r.height / pHeight) * H
            };
        };

        const wrap = (text, maxW) => {
            const words = text.split(' ');
            const lines = []; let current = '';
            words.forEach(w => {
                const test = current ? `${current} ${w}` : w;
                if (ctx.measureText(test).width > maxW) { lines.push(current); current = w; }
                else current = test;
            });
            lines.push(current); return lines;
        };

        // Draw Logos (Fixed positions per branding request)
        if (formData.showLogoIasd && assets.iasd) {
            const img = await loadImg(assets.iasd);
            const aspect = img.width / img.height;
            const h = formData.logoIasdSize * (H / pH);
            const w = h * aspect;
            ctx.drawImage(img, W * 0.05, H * 0.05, w, h);
        }
        if (formData.showLogoOasis && assets.oasis) {
            const img = await loadImg(assets.oasis);
            const aspect = img.width / img.height;
            const h = formData.logoOasisSize * (H / pH);
            const w = h * aspect;
            ctx.drawImage(img, W * 0.95 - w, H * 0.04, w, h);
        }
        if (formData.showRrss && assets.rrss) {
            const img = await loadImg(assets.rrss);
            const aspect = img.width / img.height;
            const h = formData.rrssSize * (H / pH);
            const w = h * aspect;
            ctx.drawImage(img, W * 0.5 - w / 2, H * 0.95 - h, w, h);
        }

        // Tag rendering with 4 styles
        if (formData.tag) {
            const pos = getRelPos(tagRef);
            if (pos) {
                const fs = Math.round(getFs(tagRef));
                // Branding fonts often don't need 'bold' tag in canvas if already thick
                ctx.font = `${fs}px "${formData.tagFont}", Arial, sans-serif`;
                const text = formData.tag.toUpperCase();
                const tw = ctx.measureText(text).width;
                const pad = fs * 0.6;
                const rectW = tw + pad * 2, rectH = fs * 1.6;

                if (formData.tagStyle === 'pill-translucent') {
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.beginPath(); ctx.roundRect(pos.x + pos.w / 2 - rectW / 2, pos.y + pos.h / 2 - rectH / 2, rectW, rectH, rectH / 2); ctx.fill();
                    ctx.fillStyle = formData.tagColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(text, pos.x + pos.w / 2, pos.y + pos.h / 2 + 2);
                } else if (formData.tagStyle === 'outline') {
                    ctx.strokeStyle = formData.tagColor; ctx.lineWidth = 2;
                    ctx.strokeRect(pos.x + pos.w / 2 - rectW / 2, pos.y + pos.h / 2 - rectH / 2, rectW, rectH);
                    ctx.fillStyle = formData.tagColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(text, pos.x + pos.w / 2, pos.y + pos.h / 2 + 2);
                } else if (formData.tagStyle === 'ghost') {
                    ctx.fillStyle = formData.tagColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(text, pos.x + pos.w / 2, pos.y + pos.h / 2 + 2);
                } else if (formData.tagStyle === 'solid') {
                    ctx.fillStyle = formData.tagBgColor;
                    ctx.beginPath(); ctx.roundRect(pos.x + pos.w / 2 - rectW / 2, pos.y + pos.h / 2 - rectH / 2, rectW, rectH, 4); ctx.fill();
                    ctx.fillStyle = formData.tagColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(text, pos.x + pos.w / 2, pos.y + pos.h / 2 + 2);
                }
            }
        }

        // Title 1
        if (formData.title) {
            const pos = getRelPos(titleRef);
            if (pos) {
                const fs = Math.round(getFs(titleRef));
                const bold = formData.titleBold ? 'bold ' : '';
                const italic = formData.titleItalic ? 'italic ' : '';
                const lh = formData.titleLineHeight || 1.2;
                ctx.font = `${italic}${bold}${fs}px "${formData.titleFont}", serif`;
                ctx.globalAlpha = (formData.titleOpacity || 100) / 100;
                ctx.fillStyle = formData.titleColor; ctx.textAlign = formData.titleAlign || 'center'; ctx.textBaseline = 'top';
                if (formData.titleShadow) { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
                else { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 15; }
                const lines = wrap(formData.title, W * 0.9);
                const alignX = formData.titleAlign === 'left' ? pos.x + 20 : formData.titleAlign === 'right' ? pos.x + pos.w - 20 : pos.x + pos.w / 2;
                lines.forEach((l, i) => {
                    ctx.fillText(l, alignX, pos.y + i * fs * lh);
                    if (formData.titleUnderline) { const tw = ctx.measureText(l).width; ctx.fillRect(alignX - tw / 2, pos.y + i * fs * lh + fs + 2, tw, 2); }
                });
                ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
                ctx.globalAlpha = 1;
            }
        }

        // Title 2
        if (formData.title2) {
            const pos = getRelPos(title2Ref);
            if (pos) {
                const fs = Math.round(getFs(title2Ref));
                const bold = formData.title2Bold ? 'bold ' : '';
                const italic = formData.title2Italic ? 'italic ' : '';
                const lh = formData.title2LineHeight || 1.2;
                ctx.font = `${italic}${bold}${fs}px "${formData.title2Font}", Arial`;
                ctx.globalAlpha = (formData.title2Opacity || 100) / 100;
                ctx.fillStyle = formData.title2Color; ctx.textAlign = formData.title2Align || 'center'; ctx.textBaseline = 'top';
                if (formData.title2Shadow) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
                const lines = wrap(formData.title2, W * 0.9);
                const alignX = formData.title2Align === 'left' ? pos.x + 20 : formData.title2Align === 'right' ? pos.x + pos.w - 20 : pos.x + pos.w / 2;
                lines.forEach((l, i) => ctx.fillText(l, alignX, pos.y + i * fs * lh));
                ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
                ctx.globalAlpha = 1;
            }
        }

        // Title 3
        if (formData.title3) {
            const pos = getRelPos(title3Ref);
            if (pos) {
                const fs = Math.round(getFs(title3Ref));
                const bold = formData.title3Bold ? 'bold ' : '';
                const italic = formData.title3Italic ? 'italic ' : '';
                const lh = formData.title3LineHeight || 1.2;
                ctx.font = `${italic}${bold}${fs}px "${formData.title3Font}", Arial`;
                ctx.globalAlpha = (formData.title3Opacity || 100) / 100;
                ctx.fillStyle = formData.title3Color; ctx.textAlign = formData.title3Align || 'center'; ctx.textBaseline = 'top';
                if (formData.title3Shadow) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; }
                const lines = wrap(formData.title3, W * 0.9);
                const alignX = formData.title3Align === 'left' ? pos.x + 20 : formData.title3Align === 'right' ? pos.x + pos.w - 20 : pos.x + pos.w / 2;
                lines.forEach((l, i) => ctx.fillText(l, alignX, pos.y + i * fs * lh));
                ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
                ctx.globalAlpha = 1;
            }
        }

        // Speaker
        if (formData.speaker) {
            const pos = getRelPos(speakerRef);
            if (pos) {
                const fs = Math.round(getFs(speakerRef));
                const bold = formData.speakerBold ? 'bold ' : '';
                const italic = formData.speakerItalic ? 'italic ' : '';
                ctx.font = `${italic}${bold}${fs}px "${formData.speakerFont}", cursive`;
                ctx.globalAlpha = (formData.speakerOpacity || 100) / 100;
                ctx.fillStyle = formData.speakerColor; ctx.textAlign = formData.speakerAlign || 'center'; ctx.textBaseline = 'top';
                const alignX = formData.speakerAlign === 'left' ? pos.x + 20 : formData.speakerAlign === 'right' ? pos.x + pos.w - 20 : pos.x + pos.w / 2;
                ctx.fillText(formData.speaker, alignX, pos.y);
                ctx.globalAlpha = 1;
            }
        }

        // Content
        if (formData.content) {
            const pos = getRelPos(contentRef);
            if (pos) {
                const fs = Math.round(getFs(contentRef));
                ctx.font = `${fs}px "${formData.contentFont}", Arial`;
                if (formData.contentStyle === 'biblical') {
                    ctx.fillStyle = `rgba(255,255,255,${formData.contentBgOpacity})`;
                    ctx.beginPath(); ctx.roundRect(pos.x - 20, pos.y - 15, pos.w + 40, pos.h + 30, 15); ctx.fill();
                    // Biblical Patterns for Content
                    if (formData.contentStyle === 'biblical' && formData.contentPattern !== 'none') {
                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(pos.x - 20, pos.y - 15, pos.w + 40, pos.h + 30, 15);
                        ctx.clip();

                        if (formData.contentPattern === 'dots') {
                            for (let x = pos.x - 20; x < pos.x + pos.w + 20; x += 30) {
                                for (let y = pos.y - 15; y < pos.y + pos.h + 15; y += 30) {
                                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                                    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
                                }
                            }
                        } else if (formData.contentPattern === 'lines') {
                            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                            ctx.lineWidth = 1;
                            for (let i = -W; i < W + H; i += 25) {
                                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
                            }
                        } else if (formData.contentPattern === 'grain') {
                            ctx.fillStyle = 'rgba(255,255,255,0.05)';
                            for (let i = 0; i < 2000; i++) {
                                const gx = pos.x - 20 + Math.random() * (pos.w + 40);
                                const gy = pos.y - 15 + Math.random() * (pos.h + 30);
                                ctx.fillRect(gx, gy, 1.5, 1.5);
                            }
                        }
                        ctx.restore();
                    }
                }

                ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                const lines = wrap(formData.content, pos.w);
                lines.forEach((l, i) => ctx.fillText(l, pos.x + pos.w / 2, pos.y + i * fs * 1.4));
            }
        }

        // Date, Time, Location
        const ICONS = {
            calendar: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'),
            clock: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'),
            location: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>')
        };

        const drawInfoPill = async (ref, text, font, size, iconType) => {
            const pos = getRelPos(ref);
            if (!pos) return;
            const fs = Math.round(getFs(ref));
            ctx.font = `${fs}px "${font}", sans-serif`;

            const gap = fs * 0.4;
            const iconSize = fs * 1.0;
            const tw = ctx.measureText(text).width;
            const contentW = tw + (iconType ? iconSize + gap : 0);
            const pad = fs * 0.8;
            const rectW = contentW + pad * 2;
            const rectH = fs * 1.8;

            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.roundRect(pos.x + pos.w / 2 - rectW / 2, pos.y + pos.h / 2 - rectH / 2, rectW, rectH, rectH / 2);
            ctx.fill();
            ctx.stroke();

            let textX = pos.x + pos.w / 2;
            if (iconType) {
                try {
                    const img = await loadImg(ICONS[iconType]);
                    const iconX = (pos.x + pos.w / 2) - contentW / 2;
                    const iconY = (pos.y + pos.h / 2) - iconSize / 2;
                    ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
                    textX = iconX + iconSize + gap + tw / 2;
                } catch (e) { console.error('Icon failed'); }
            }

            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, textX, pos.y + pos.h / 2 + fs * 0.1);
        };

        if (formData.date || formData.time) {
            const dateStr = formData.date ? new Date(formData.date + 'T00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : '';
            const combinedStr = [dateStr, formData.time].filter(Boolean).join(' - ');
            const iconType = formData.date ? 'calendar' : 'clock';
            await drawInfoPill(dateRef, combinedStr, formData.dateFont, formData.dateSize, iconType);
        }
        if (formData.location) await drawInfoPill(locationRef, formData.location, formData.tagFont || 'Arial', formData.locationSize, 'location');

        // RRSS
        if (formData.showRrss && assets.rrss) {
            const pos = getRelPos(rrssRef);
            if (pos) {
                const img = await loadImg(assets.rrss);
                const aspect = img.width / img.height;
                let finalH = formData.rrssSize * (H / pH);
                let finalW = finalH * aspect;
                if (finalW > W * 0.9) {
                    finalW = W * 0.9;
                    finalH = finalW / aspect;
                }
                const x = W / 2 - finalW / 2; // Center strictly within canvas
                const y = pos.y + (pos.h / 2) - (finalH / 2);
                ctx.globalAlpha = 0.9; ctx.drawImage(img, x, y, finalW, finalH); ctx.globalAlpha = 1;
            }
        }
        // Shapes overlay
        if (Array.isArray(formData.shapes) && formData.shapes.length > 0) {
            for (const sh of formData.shapes) {
                const sx = (sh.x / 100) * W;
                const sy = (sh.y / 100) * H;
                const sz = sh.size || 80;
                const grad = ctx.createLinearGradient(
                    sx - sz / 2 + Math.cos((sh.angle || 135) * Math.PI / 180) * sz,
                    sy - sz / 2 + Math.sin((sh.angle || 135) * Math.PI / 180) * sz,
                    sx + sz / 2, sy + sz / 2
                );
                grad.addColorStop(0, sh.gradFrom || '#5b2ea6');
                grad.addColorStop(1, sh.gradTo || '#a78bfa');
                ctx.fillStyle = grad;
                ctx.beginPath();
                if (sh.type === 'circle') {
                    ctx.arc(sx, sy, sz / 2, 0, Math.PI * 2);
                } else if (sh.type === 'triangle') {
                    ctx.moveTo(sx, sy - sz / 2); ctx.lineTo(sx + sz / 2, sy + sz / 2); ctx.lineTo(sx - sz / 2, sy + sz / 2);
                } else if (sh.type === 'diamond') {
                    ctx.moveTo(sx, sy - sz / 2); ctx.lineTo(sx + sz / 2, sy); ctx.lineTo(sx, sy + sz / 2); ctx.lineTo(sx - sz / 2, sy);
                } else if (sh.type === 'rounded') {
                    ctx.roundRect(sx - sz / 2, sy - sz / 2, sz, sz, sz * 0.2);
                } else if (sh.type === 'line') {
                    ctx.lineWidth = 6; ctx.strokeStyle = sh.gradFrom || '#5b2ea6';
                    ctx.moveTo(sx - sz / 2, sy); ctx.lineTo(sx + sz / 2, sy);
                    ctx.stroke(); ctx.beginPath();
                } else {
                    ctx.rect(sx - sz / 2, sy - sz / 2, sz, sz);
                }
                ctx.fill();
            }
        }

        return canvas;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const canvas = await composeCanvas();

            // Upload to Cloudinary (returns {success, imageUrl, error})
            console.log('📤 Uploading to Cloudinary...');
            const uploadResult = await uploadCanvasToCloudinary(canvas);

            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Cloudinary upload failed');
            }

            console.log('✅ Cloudinary URL:', uploadResult.imageUrl);

            const announcementData = {
                title: formData.title,
                content: formData.content,
                tag: formData.tag,
                date: formData.date || null,
                time: formData.time || null,
                location: formData.location || null,
                imageUrl: uploadResult.imageUrl  // Extract URL from result object
            };

            if (formData.id) {
                await apiClient.put(`/announcements/${formData.id}`, announcementData);
            } else {
                await apiClient.post('/announcements', announcementData);
            }

            fetchAnnouncements(); setShowForm(false); resetForm();
        } catch (err) {
            console.error('❌ Save error:', err);
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Error al guardar: ' + msg);
        }
        finally { setIsSubmitting(false); }
    };

    const handleEdit = (ann) => {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // Handle different imageUrl formats: base64, http URLs, or local filenames
        let imgUrl = null;
        if (ann.imageUrl) {
            if (ann.imageUrl.startsWith('data:image') || ann.imageUrl.startsWith('http')) {
                imgUrl = ann.imageUrl;
            } else {
                imgUrl = `${base}/uploads/${ann.imageUrl}`;
            }
        }
        setFormData({ ...DEFAULTS, id: ann.id, title: ann.title, content: ann.content, tag: ann.tag, date: ann.date?.split('T')[0], bgMode: imgUrl ? 'image' : 'gradient', bgImage: imgUrl });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar?')) return;
        try {
            await apiClient.delete(`/announcements/${id}`);
            fetchAnnouncements();
        } catch { alert('Error'); }
    };

    const resetForm = () => {
        setFormData(DEFAULTS);
        setImageFile(null);
    };

    const applyTemplate = (tpl) => {
        setFormData(prev => ({
            ...prev,
            ...tpl,
            id: prev.id, // Preserve ID if editing
            title: prev.title || 'Título',
            title2: prev.title2 || 'Subtítulo',
            speaker: prev.speaker || 'Invitado',
        }));
        setShowTemplatePicker(false);
    };

    // Descargar PNG directamente
    const handleDownloadPNG = async () => {
        try {
            const canvas = await composeCanvas();
            const link = document.createElement('a');
            link.download = `${formData.title || 'anuncio'}-oasispress.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download PNG error:', err);
            alert('Error al descargar: ' + err.message);
        }
    };

    const glass = { background: theme.glass.background, backdropFilter: theme.glass.backdropFilter, border: theme.glass.border, borderRadius: theme.glass.borderRadius, boxShadow: theme.glass.boxShadow };
    const currentFmt = FORMATS[formData.format] || FORMATS.instagram;

    // Preview BG Style including blend if active
    const previewBgStyle = formData.bgMode === 'image' && formData.bgImage
        ? {
            backgroundImage: formData.blendGradient
                ? `linear-gradient(rgba(${parseInt(formData.gradientStart.slice(1, 3), 16)}, ${parseInt(formData.gradientStart.slice(3, 5), 16)}, ${parseInt(formData.gradientStart.slice(5, 7), 16)}, ${formData.blendOpacity}), rgba(${parseInt(formData.gradientEnd.slice(1, 3), 16)}, ${parseInt(formData.gradientEnd.slice(3, 5), 16)}, ${parseInt(formData.gradientEnd.slice(5, 7), 16)}, ${formData.blendOpacity})), url(${formData.bgImage})`
                : `url(${formData.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: `${formData.bgPosX}% ${formData.bgPosY}%`
        }
        : { background: `linear-gradient(135deg, ${formData.gradientStart}, ${formData.gradientEnd})` };

    // Canva UI Helpers
    const renderSidebar = () => (
        <div className="canva-sidebar d-flex flex-column align-items-center bg-dark text-white py-3 shadow-lg" style={{ width: '72px', zIndex: 100, position: 'relative' }}>
            <div className="canva-logo-mini mb-4" onClick={() => navigate('/admin')}>
                <img src={logoOasis} style={{ height: '32px' }} alt="Oasis" />
            </div>
            {SIDEBAR_ITEMS.map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                        setActiveSidebar(item.id);
                        setIsSidebarCollapsed(false);
                        setShowForm(false); // Close MIS ANUNCIOS to prevent overlap
                    }}
                    className={`nav-btn d-flex flex-column align-items-center justify-content-center border-0 mb-2 py-2 w-100 transition-all ${activeSidebar === item.id && !isSidebarCollapsed ? 'active-sidebar-btn' : 'text-white-50'}`}
                    style={{ background: 'transparent', fontSize: '0.65rem' }}
                >
                    <i className={`bi ${item.icon} fs-4 mb-1`}></i>
                    <span>{item.label}</span>
                </button>
            ))}
            <div className="mt-auto">
                <button className="nav-btn border-0 py-2 w-100 text-white-50" onClick={handleFullscreen} title="Fullscreen">
                    <i className="bi bi-arrows-fullscreen"></i>
                </button>
            </div>
        </div>
    );

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
                        top: activeMode === 'anuncios' ? '164px' : '42px', // 42px header + 122px ribbon
                        left: 0,
                        bottom: 0,
                        width: '300px',
                        zIndex: 200,
                        overflowY: 'auto',
                        borderRight: '1px solid #e9ecef'
                    }}
                >
                    <div className="p-3 d-flex justify-content-between align-items-center border-bottom sticky-top bg-white">
                        <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', color: '#5b2ea6' }}>{SIDEBAR_ITEMS.find(i => i.id === activeSidebar)?.label}</h6>
                        <button className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setIsSidebarCollapsed(true)}></button>
                    </div>
                    <div className="panel-content p-3">
                        {/* ══════════ DISEÑO: Plantillas + Fondos ══════════ */}
                        {activeSidebar === 'design' && (
                            <div className="design-panel">
                                {/* Plantillas */}
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Plantillas</label>
                                <div className="row g-2 mb-4">
                                    {TEMPLATES.map(tpl => (
                                        <div key={tpl.id} className="col-6">
                                            <div className="tpl-card rounded-3 cursor-pointer overflow-hidden border shadow-sm hover-scale"
                                                onClick={() => applyTemplate(tpl)}
                                                style={{ height: '80px', background: `linear-gradient(135deg, ${tpl.gradientStart}, ${tpl.gradientEnd})` }}>
                                                <div className="d-flex h-100 align-items-center justify-content-center p-2 text-center text-white x-small fw-bold">
                                                    {tpl.name}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Colores de Fondo */}
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Fondo</label>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <input type="color" className="form-control form-control-color w-100 shadow-sm" style={{ height: '36px' }} value={formData.gradientStart} onChange={e => set('gradientStart', e.target.value)} title="Color inicial" />
                                    </div>
                                    <div className="col-6">
                                        <input type="color" className="form-control form-control-color w-100 shadow-sm" style={{ height: '36px' }} value={formData.gradientEnd} onChange={e => set('gradientEnd', e.target.value)} title="Color final" />
                                    </div>
                                </div>
                                <button className="btn btn-sm btn-outline-primary w-100 rounded-pill mb-3" onClick={() => setMany({ gradientStart: '#5b2ea6', gradientEnd: '#16213e' })}>
                                    <i className="bi bi-stars me-1"></i>Colores Oasis
                                </button>

                                {/* Mezcla */}
                                {formData.bgImage && (
                                    <div className="p-2 bg-light rounded-3 border mb-3">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" checked={formData.blendGradient} onChange={e => set('blendGradient', e.target.checked)} id="blendCheck" />
                                            <label className="x-small fw-bold" htmlFor="blendCheck">Mezclar con imagen</label>
                                        </div>
                                        {formData.blendGradient && (
                                            <>
                                                <input type="range" className="form-range mt-2" min="0" max="1" step="0.05" value={formData.blendOpacity} onChange={e => set('blendOpacity', parseFloat(e.target.value))} />
                                                <span className="x-small text-muted">{Math.round(formData.blendOpacity * 100)}%</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ MEDIOS: Imágenes + Subir ══════════ */}
                        {activeSidebar === 'media' && (
                            <div className="media-panel">
                                {/* Subir imagen */}
                                <div className="upload-area text-center p-3 border-dashed rounded-3 bg-light mb-4" style={{ cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                                    <i className="bi bi-cloud-arrow-up fs-3 text-primary d-block mb-1"></i>
                                    <span className="x-small text-muted">Subir imagen</span>
                                    <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                                </div>
                                {formData.bgImage && formData.bgMode === 'image' && (
                                    <div className="mb-4 p-2 bg-light rounded-3 border">
                                        <img src={formData.bgImage} className="img-fluid rounded-2 w-100" style={{ height: '80px', objectFit: 'cover' }} />
                                        <button className="btn btn-link btn-sm text-danger w-100 p-0 mt-1" onClick={() => setMany({ bgImage: null, bgMode: 'gradient' })}>
                                            <i className="bi bi-trash me-1"></i>Quitar
                                        </button>
                                    </div>
                                )}

                                {/* Galería de stock */}
                                {Object.entries(STOCK_CATEGORIES).map(([cat, imgs]) => (
                                    <div key={cat} className="mb-3">
                                        <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">{cat}</label>
                                        <div className="row g-1">
                                            {imgs.map((img, i) => (
                                                <div key={i} className="col-4">
                                                    <img src={img} onClick={() => handleSelectStock(img)} className="img-fluid rounded-2 cursor-pointer hover-scale shadow-sm" style={{ height: '55px', width: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ══════════ TEXTO: Panel Unificado ══════════ */}
                        {activeSidebar === 'text' && (
                            <div className="text-panel">
                                {/* Selector de elementos - Iconos cuadrados */}
                                <div className="d-flex flex-wrap gap-1 mb-3">
                                    {[
                                        { id: 'title', icon: 'bi-type-h1', label: 'Título' },
                                        { id: 'title2', icon: 'bi-type-h2', label: 'Sub 1' },
                                        { id: 'title3', icon: 'bi-type-h3', label: 'Sub 2' },
                                        { id: 'speaker', icon: 'bi-person', label: 'Orador' },
                                        { id: 'tag', icon: 'bi-tag', label: 'Etiqueta' },
                                        { id: 'date', icon: 'bi-calendar3', label: 'Fecha' },
                                        { id: 'time', icon: 'bi-clock', label: 'Hora' },
                                        { id: 'location', icon: 'bi-geo-alt', label: 'Lugar' },
                                    ].map(el => (
                                        <button key={el.id}
                                            className={`btn p-2 rounded-2 border d-flex flex-column align-items-center justify-content-center ${selectedElementId === el.id ? 'btn-primary text-white' : 'btn-light'}`}
                                            style={{ width: '48px', height: '48px' }}
                                            onClick={() => setSelectedElementId(el.id)}
                                            title={el.label}>
                                            <i className={`bi ${el.icon} fs-5`}></i>
                                            <span style={{ fontSize: '0.55rem', marginTop: '2px' }}>{el.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Panel de controles del elemento seleccionado */}
                                {selectedElementId && (
                                    <div className="selected-element-panel p-3 bg-light rounded-3 border mb-3">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="small fw-bold text-primary text-uppercase">{selectedElementId}</span>
                                            <button className="btn btn-sm p-0 text-muted" onClick={() => setSelectedElementId(null)}><i className="bi bi-x-lg"></i></button>
                                        </div>

                                        {/* Input de texto/fecha/hora según tipo */}
                                        {selectedElementId === 'date' ? (
                                            <input type="date" className="form-control form-control-sm mb-2"
                                                value={formData.date || ''} onChange={e => set('date', e.target.value)} />
                                        ) : selectedElementId === 'time' ? (
                                            <input type="time" className="form-control form-control-sm mb-2"
                                                value={formData.time || ''} onChange={e => set('time', e.target.value)} />
                                        ) : (
                                            <input type="text" className="form-control form-control-sm mb-2"
                                                value={formData[selectedElementId] || ''}
                                                onChange={e => set(selectedElementId, e.target.value)}
                                                placeholder={`Texto de ${selectedElementId}...`} />
                                        )}

                                        {/* Fila: Fuente + Tamaño */}
                                        <div className="d-flex gap-2 mb-2">
                                            <div className="flex-grow-1">
                                                <label className="x-small text-muted mb-1"><i className="bi bi-fonts me-1"></i>Fuente</label>
                                                <select className="form-select form-select-sm" style={{ fontSize: '0.7rem' }}
                                                    value={formData[`${selectedElementId}Font`] || 'AdventSans'}
                                                    onChange={e => set(`${selectedElementId}Font`, e.target.value)}>
                                                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ width: '70px' }}>
                                                <label className="x-small text-muted mb-1"><i className="bi bi-arrows-angle-expand me-1"></i>Tam</label>
                                                <input type="number" className="form-control form-control-sm text-center"
                                                    value={Math.round((formData[`${selectedElementId}Size`] || 1) * 10) / 10}
                                                    onChange={e => set(`${selectedElementId}Size`, parseFloat(e.target.value) || 1)}
                                                    step="0.1" min="0.1" max="10" />
                                            </div>
                                        </div>

                                        {/* Fila: Opacidad + Color */}
                                        <div className="d-flex gap-2 align-items-end">
                                            <div className="flex-grow-1">
                                                <label className="x-small text-muted mb-1"><i className="bi bi-droplet-half me-1"></i>Opacidad: {formData[`${selectedElementId}Opacity`] || 100}%</label>
                                                <input type="range" className="form-range" min="0" max="100"
                                                    value={formData[`${selectedElementId}Opacity`] || 100}
                                                    onChange={e => set(`${selectedElementId}Opacity`, parseInt(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="x-small text-muted mb-1"><i className="bi bi-palette me-1"></i>Color</label>
                                                <div className="d-flex gap-1">
                                                    <input type="color" className="form-control form-control-color border-0 rounded"
                                                        style={{ width: '32px', height: '32px' }}
                                                        value={formData[`${selectedElementId}Color`] || '#ffffff'}
                                                        onChange={e => set(`${selectedElementId}Color`, e.target.value)} />
                                                    <input type="text" className="form-control form-control-sm text-uppercase"
                                                        style={{ width: '70px', fontSize: '0.65rem' }}
                                                        value={(formData[`${selectedElementId}Color`] || '#ffffff').replace('#', '')}
                                                        onChange={e => set(`${selectedElementId}Color`, `#${e.target.value.replace('#', '')}`)}
                                                        maxLength={6} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Color de fondo para tag */}
                                        {selectedElementId === 'tag' && (
                                            <div className="mt-2 pt-2 border-top">
                                                <label className="x-small text-muted mb-1"><i className="bi bi-square-fill me-1"></i>Fondo Tag</label>
                                                <div className="d-flex gap-1">
                                                    <input type="color" className="form-control form-control-color border-0 rounded"
                                                        style={{ width: '32px', height: '32px' }}
                                                        value={formData.tagBgColor || '#5b2ea6'}
                                                        onChange={e => set('tagBgColor', e.target.value)} />
                                                    <input type="text" className="form-control form-control-sm text-uppercase"
                                                        style={{ width: '70px', fontSize: '0.65rem' }}
                                                        value={(formData.tagBgColor || '#5b2ea6').replace('#', '')}
                                                        onChange={e => set('tagBgColor', `#${e.target.value.replace('#', '')}`)}
                                                        maxLength={6} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Colores rápidos (presets) */}
                                <div className="quick-colors mb-3">
                                    <label className="x-small text-muted fw-bold mb-1 d-block">COLORES RÁPIDOS</label>
                                    <div className="d-flex gap-1 flex-wrap">
                                        {['#ffffff', '#000000', '#5b2ea6', '#ff6b35', '#f7c59f', '#2ec4b6', '#e71d36', '#011627', '#ffd700', '#00ff88'].map(c => (
                                            <button key={c} className="btn p-0 border rounded-1"
                                                style={{ width: '24px', height: '24px', background: c }}
                                                onClick={() => selectedElementId && set(`${selectedElementId}Color`, c)}
                                                title={c}></button>
                                        ))}
                                    </div>
                                </div>

                                {/* Info: selecciona elemento */}
                                {!selectedElementId && (
                                    <div className="text-center text-muted py-4">
                                        <i className="bi bi-hand-index fs-1 opacity-25"></i>
                                        <p className="x-small mt-2">Selecciona un elemento arriba para editarlo</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ MARCA: Logos ══════════ */}
                        {activeSidebar === 'brand' && (
                            <div className="brand-panel">
                                {/* Selector de logos - Iconos cuadrados */}
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {[
                                        { id: 'logoOasis', src: logoOasis, label: 'Oasis', show: 'showLogoOasis', size: 'logoOasisSize' },
                                        { id: 'logoIasd', src: logoAdventista, label: 'IASD', show: 'showLogoIasd', size: 'logoIasdSize' },
                                        { id: 'rrss', icon: 'bi-share', label: 'RRSS', show: 'showRrss', size: 'rrssSize' },
                                    ].map(logo => (
                                        <div key={logo.id} className="position-relative">
                                            <button
                                                className={`btn p-2 rounded-3 border d-flex flex-column align-items-center justify-content-center ${formData[logo.show] ? 'btn-primary text-white' : 'btn-light'}`}
                                                style={{ width: '64px', height: '64px' }}
                                                onClick={() => set(logo.show, !formData[logo.show])}
                                                title={logo.label}>
                                                {logo.src ? (
                                                    <img src={logo.src} alt={logo.label} style={{ height: '28px', maxWidth: '50px', objectFit: 'contain', filter: formData[logo.show] ? 'brightness(10)' : 'none' }} />
                                                ) : (
                                                    <i className={`bi ${logo.icon} fs-4`}></i>
                                                )}
                                                <span style={{ fontSize: '0.55rem', marginTop: '4px' }}>{logo.label}</span>
                                            </button>
                                            {formData[logo.show] && (
                                                <span className="position-absolute top-0 end-0 translate-middle badge bg-success rounded-circle p-1" style={{ fontSize: '0.5rem' }}>
                                                    <i className="bi bi-check"></i>
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {/* Custom logos from storage */}
                                    {(formData.customLogos || []).map((logo, idx) => (
                                        <div key={`custom-${idx}`} className="position-relative">
                                            <button
                                                className={`btn p-2 rounded-3 border d-flex flex-column align-items-center justify-content-center ${formData[`showCustomLogo${idx}`] ? 'btn-primary text-white' : 'btn-light'}`}
                                                style={{ width: '64px', height: '64px' }}
                                                onClick={() => set(`showCustomLogo${idx}`, !formData[`showCustomLogo${idx}`])}
                                                title={logo.name || `Logo ${idx + 1}`}>
                                                <img src={logo.url} alt={logo.name} style={{ height: '28px', maxWidth: '50px', objectFit: 'contain', filter: formData[`showCustomLogo${idx}`] ? 'brightness(10)' : 'none' }} />
                                                <span style={{ fontSize: '0.55rem', marginTop: '4px' }}>{logo.name?.slice(0, 6) || `#${idx + 1}`}</span>
                                            </button>
                                            <button
                                                className="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle p-0"
                                                style={{ width: '16px', height: '16px', fontSize: '0.5rem', lineHeight: 1 }}
                                                onClick={e => { e.stopPropagation(); set('customLogos', (formData.customLogos || []).filter((_, i) => i !== idx)); }}>
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add custom logo button */}
                                    <label className="btn btn-outline-secondary p-2 rounded-3 border-dashed d-flex flex-column align-items-center justify-content-center" style={{ width: '64px', height: '64px', cursor: 'pointer' }}>
                                        <i className="bi bi-plus-lg fs-4"></i>
                                        <span style={{ fontSize: '0.55rem', marginTop: '4px' }}>Añadir</span>
                                        <input type="file" accept="image/*" className="d-none" onChange={async e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                const newLogos = [...(formData.customLogos || []), { name: file.name.replace(/\.[^.]+$/, ''), url: reader.result }];
                                                set('customLogos', newLogos);
                                            };
                                            reader.readAsDataURL(file);
                                            e.target.value = '';
                                        }} />
                                    </label>
                                </div>

                                {/* Tamaño individual por logo activo */}
                                <div className="bg-light rounded-3 p-3 border">
                                    <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">TAMAÑO POR LOGO</label>
                                    <div style={{ fontSize: '0.7rem' }}>
                                        {formData.showLogoOasis && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <img src={logoOasis} alt="Oasis" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                                <input type="range" className="form-range flex-grow-1" min="15" max="80"
                                                    value={formData.logoOasisSize} onChange={e => set('logoOasisSize', parseInt(e.target.value))} />
                                                <span className="text-muted" style={{ width: '35px' }}>{formData.logoOasisSize}px</span>
                                            </div>
                                        )}
                                        {formData.showLogoIasd && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <img src={logoAdventista} alt="IASD" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                                <input type="range" className="form-range flex-grow-1" min="15" max="80"
                                                    value={formData.logoIasdSize} onChange={e => set('logoIasdSize', parseInt(e.target.value))} />
                                                <span className="text-muted" style={{ width: '35px' }}>{formData.logoIasdSize}px</span>
                                            </div>
                                        )}
                                        {formData.showRrss && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <i className="bi bi-share" style={{ width: '24px', textAlign: 'center' }}></i>
                                                <input type="range" className="form-range flex-grow-1" min="15" max="80"
                                                    value={formData.rrssSize} onChange={e => set('rrssSize', parseInt(e.target.value))} />
                                                <span className="text-muted" style={{ width: '35px' }}>{formData.rrssSize}px</span>
                                            </div>
                                        )}
                                        {(formData.customLogos || []).map((logo, idx) => formData[`showCustomLogo${idx}`] && (
                                            <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                                                <img src={logo.url} alt={logo.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                                <input type="range" className="form-range flex-grow-1" min="15" max="80"
                                                    value={formData[`customLogoSize${idx}`] || 30} onChange={e => set(`customLogoSize${idx}`, parseInt(e.target.value))} />
                                                <span className="text-muted" style={{ width: '35px' }}>{formData[`customLogoSize${idx}`] || 30}px</span>
                                            </div>
                                        ))}
                                        {!formData.showLogoOasis && !formData.showLogoIasd && !formData.showRrss && !(formData.customLogos || []).some((_, idx) => formData[`showCustomLogo${idx}`]) && (
                                            <p className="text-muted text-center mb-0 py-2"><i className="bi bi-eye-slash me-2"></i>Activa un logo para ajustar tamaño</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Publish Button in Panel (Optional/Secondary) */}
                    <div className="p-3 border-top mt-auto">
                        <button className="btn btn-dark w-100 rounded-pill x-small fw-bold py-2 shadow-sm" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'PUBLICANDO...' : '✓ GUARDAR Y PUBLICAR'}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Ribbon Menu - PowerPoint/Illustrator Style
    const renderRibbon = () => {
        const target = selectedElementId || 'title';
        const isLogo = target.toLowerCase().includes('logo') || target.toLowerCase().includes('rrss') || target.toLowerCase().includes('customlogo');
        const fontSizeKey = `${target}Size`;
        const fontColorKey = `${target}Color`;
        const fontKey = `${target}Font`;

        return (
            <div className="ribbon-container bg-white border-bottom shadow-sm flex-shrink-0" style={{ borderRadius: '0' }}>

                {/* ── Tab row: tabs + acciones derecha (sin barra oscura) ── */}
                <div className="d-flex border-bottom px-1" style={{ gap: '0', background: '#f8f9fa', alignItems: 'stretch' }}>
                    {['Inicio', 'Insertar', 'Diseño', 'Formato'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveRibbonTab(tab.toLowerCase())}
                            style={{
                                border: 'none',
                                borderBottom: activeRibbonTab === tab.toLowerCase() ? '3px solid #5b2ea6' : '3px solid transparent',
                                background: 'transparent',
                                padding: '5px 16px',
                                fontSize: '0.82rem',
                                fontWeight: activeRibbonTab === tab.toLowerCase() ? 700 : 400,
                                color: activeRibbonTab === tab.toLowerCase() ? '#5b2ea6' : '#555',
                                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                            }}
                        >{tab}</button>
                    ))}

                    {/* Acciones al lado derecho — sin barra oscura */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '8px', flexShrink: 0 }}>
                        <button onClick={() => setShowForm(!showForm)} title="Mis Anuncios"
                            style={{ border: '1px solid #dee2e6', borderRadius: '6px', background: showForm ? '#ede9fe' : '#fff', color: showForm ? '#5b2ea6' : '#444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 9px', cursor: 'pointer', gap: '0', minWidth: '46px', fontSize: '0.55rem', fontWeight: 600 }}>
                            <i className="bi bi-folder2-open" style={{ fontSize: '0.95rem' }}></i>
                            <span style={{ whiteSpace: 'nowrap' }}>Mis Anuncios</span>
                        </button>
                        <button onClick={handleDownloadPNG} title="Descargar PNG"
                            style={{ border: '1px solid #dee2e6', borderRadius: '6px', background: '#fff', color: '#444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 9px', cursor: 'pointer', gap: '0', minWidth: '38px', fontSize: '0.55rem', fontWeight: 600 }}>
                            <i className="bi bi-image" style={{ fontSize: '0.95rem' }}></i>
                            <span>PNG</span>
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting} title="Guardar y Publicar"
                            style={{ border: 'none', borderRadius: '6px', background: isSubmitting ? '#6ee7b7' : '#10b981', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 12px', cursor: isSubmitting ? 'not-allowed' : 'pointer', gap: '0', minWidth: '50px', fontSize: '0.55rem', fontWeight: 700 }}>
                            <i className={`bi ${isSubmitting ? 'bi-hourglass-split' : 'bi-cloud-arrow-up'}`} style={{ fontSize: '0.95rem' }}></i>
                            <span>{isSubmitting ? 'Guardando…' : 'Guardar'}</span>
                        </button>
                        <button onClick={handleFullscreen} title="Pantalla completa"
                            style={{ border: '1px solid #dee2e6', borderRadius: '6px', background: '#fff', color: '#444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 9px', cursor: 'pointer', gap: '0', minWidth: '46px', fontSize: '0.55rem', fontWeight: 600 }}>
                            <i className="bi bi-arrows-fullscreen" style={{ fontSize: '0.95rem' }}></i>
                            <span>Compartir</span>
                        </button>
                    </div>
                </div>

                {/* ── Ribbon Content ── */}
                <div style={{ display: 'flex', alignItems: 'stretch', padding: '4px 6px', minHeight: '62px', overflowX: 'auto', background: '#fff' }}>

                    {/* ═══════ INICIO ═══════ */}
                    {activeRibbonTab === 'inicio' && (
                        <>
                            {/* ── Grupo: Elemento ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px', borderRight: '1px solid #e9ecef', justifyContent: 'space-between', gap: '3px' }}>
                                <select
                                    className="form-select form-select-sm"
                                    style={{ fontSize: '0.73rem', width: '112px', height: '26px', padding: '0 6px' }}
                                    value={selectedElementId || 'title'}
                                    onChange={(e) => setSelectedElementId(e.target.value === 'title' ? null : e.target.value)}
                                >
                                    <option value="title">Título (H1)</option>
                                    <option value="title2">Subtítulo (H2)</option>
                                    <option value="title3">Línea 3 (H3)</option>
                                    <option value="speaker">Orador</option>
                                    <option value="tag">Etiqueta</option>
                                    <option value="date">Fecha</option>
                                    <option value="time">Hora</option>
                                    <option value="location">Ubicación</option>
                                    <option value="content">Contenido</option>
                                </select>
                                <span style={{ fontSize: '0.57rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.3px' }}>Elemento</span>
                            </div>

                            {/* ── Grupo: Fuente (unificado: familia + tamaño + N K S tachado sombra) ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2px 10px', borderRight: '1px solid #e9ecef', justifyContent: 'center', gap: '3px' }}>
                                {/* Fila 1: selector tipografía + A- tamaño A+ */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ fontSize: '0.7rem', width: '108px', height: '24px', padding: '0 4px' }}
                                        value={formData[fontKey] || 'MoonRising'}
                                        onChange={(e) => set(fontKey, e.target.value)}
                                    >
                                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                        <option value="Arial">Arial</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Verdana">Verdana</option>
                                        <option value="Trebuchet MS">Trebuchet MS</option>
                                    </select>
                                    <button onClick={() => set(fontSizeKey, Math.max(isLogo ? 10 : 0.1, (formData[fontSizeKey] || 1) - (isLogo ? 5 : 0.1)))}
                                        style={{ border: '1px solid #dee2e6', borderRadius: '4px', background: '#f8f9fa', width: '22px', height: '24px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                                        title="Reducir fuente">A<sup style={{ fontSize: '0.4rem' }}>-</sup></button>
                                    <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', padding: '2px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isLogo ? Math.round(formData[fontSizeKey] || 60) : (formData[fontSizeKey] || 1).toFixed(1)}
                                    </span>
                                    <button onClick={() => set(fontSizeKey, Math.min(600, (formData[fontSizeKey] || 1) + (isLogo ? 5 : 0.1)))}
                                        style={{ border: '1px solid #dee2e6', borderRadius: '4px', background: '#f8f9fa', width: '22px', height: '24px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                                        title="Agrandar fuente">A<sup style={{ fontSize: '0.4rem' }}>+</sup></button>
                                </div>
                                {/* Fila 2: estilos (N K S tachado sombra) */}
                                {!isLogo && (
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[
                                            { key: 'Bold', label: 'N', title: 'Negrita', extraStyle: { fontWeight: 900 } },
                                            { key: 'Italic', label: 'K', title: 'Cursiva', extraStyle: { fontStyle: 'italic', fontFamily: 'serif' } },
                                            { key: 'Underline', label: 'S', title: 'Subrayado', extraStyle: { textDecoration: 'underline' } },
                                            { key: 'Strike', label: 'S̶', title: 'Tachado', extraStyle: {} },
                                            { key: 'Shadow', label: 'A', title: 'Sombra', extraStyle: { textShadow: '1px 1px 2px rgba(0,0,0,0.6)' } },
                                        ].map(btn => {
                                            const sk = `${target}${btn.key}`;
                                            const on = !!formData[sk];
                                            return (
                                                <button key={btn.key} onClick={() => set(sk, !on)} title={btn.title}
                                                    style={{ ...btn.extraStyle, width: '24px', height: '24px', border: `1px solid ${on ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '4px', background: on ? '#ede9fe' : '#f8f9fa', color: on ? '#5b2ea6' : '#444', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {btn.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.3px', alignSelf: 'center' }}>Fuente</span>
                            </div>

                            {/* ── Grupo: Color ── */}
                            {!isLogo && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px', borderRight: '1px solid #e9ecef', justifyContent: 'space-between', gap: '3px' }}>
                                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', maxWidth: '140px', alignItems: 'center' }}>
                                        <input type="color"
                                            style={{ width: '26px', height: '26px', padding: '0', border: '2px solid #dee2e6', borderRadius: '4px', cursor: 'pointer' }}
                                            value={formData[fontColorKey] || '#ffffff'}
                                            onChange={(e) => set(fontColorKey, e.target.value)}
                                            title="Color personalizado"
                                        />
                                        {['#ffffff', '#000000', '#5b2ea6', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#16a34a', '#ca8a04', '#ea580c', '#dc2626', '#db2777'].map(c => (
                                            <button key={c} onClick={() => set(fontColorKey, c)}
                                                style={{ width: '20px', height: '20px', background: c, border: formData[fontColorKey] === c ? '2px solid #5b2ea6' : '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', flexShrink: 0 }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '0.57rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.3px' }}>Color</span>
                                </div>
                            )}

                            {/* ── Grupo: Párrafo + Espaciado (unificado) ── */}
                            {!isLogo && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2px 10px', borderRight: '1px solid #e9ecef', justifyContent: 'center', gap: '3px' }}>
                                    {/* Fila 1: alineación */}
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[
                                            { val: 'left', icon: 'bi-text-left', title: 'Izquierda' },
                                            { val: 'center', icon: 'bi-text-center', title: 'Centro' },
                                            { val: 'right', icon: 'bi-text-right', title: 'Derecha' },
                                            { val: 'justify', icon: 'bi-justify', title: 'Justificado' },
                                        ].map(a => {
                                            const alignKey = `${target}Align`;
                                            const on = (formData[alignKey] || 'center') === a.val;
                                            return (
                                                <button key={a.val} onClick={() => set(alignKey, a.val)} title={a.title}
                                                    style={{ width: '24px', height: '24px', border: `1px solid ${on ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '4px', background: on ? '#ede9fe' : '#f8f9fa', color: on ? '#5b2ea6' : '#333', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className={`bi ${a.icon}`}></i>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Fila 2: interlineado dropdown */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <i className="bi bi-text-paragraph" style={{ fontSize: '0.75rem', color: '#666' }}></i>
                                        <select
                                            style={{ fontSize: '0.68rem', height: '22px', padding: '0 4px', border: '1px solid #dee2e6', borderRadius: '4px', background: '#f8f9fa' }}
                                            value={formData[`${target}LineHeight`] || 1.2}
                                            onChange={e => set(`${target}LineHeight`, parseFloat(e.target.value))}
                                        >
                                            <option value={1.0}>1.0 — Simple</option>
                                            <option value={1.2}>1.2 — Compacto</option>
                                            <option value={1.5}>1.5 — Normal</option>
                                            <option value={2.0}>2.0 — Doble</option>
                                            <option value={2.5}>2.5 — Amplio</option>
                                        </select>
                                    </div>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.3px', alignSelf: 'center' }}>Párrafo</span>
                                </div>
                            )}

                            {/* ── Grupo: Formato de diapositiva ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px', justifyContent: 'space-between', gap: '3px' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {Object.entries(FORMATS).map(([k, f]) => (
                                        <button key={k} onClick={() => set('format', k)} title={`${f.label} — ${f.desc}`}
                                            style={{ width: '28px', height: '26px', border: `1px solid ${formData.format === k ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '4px', background: formData.format === k ? '#ede9fe' : '#f8f9fa', color: formData.format === k ? '#5b2ea6' : '#555', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`bi ${f.icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.57rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.3px' }}>Formato</span>
                            </div>
                        </>
                    )}

                    {/* ═══════ INSERTAR ═══════ */}
                    {activeRibbonTab === 'insertar' && (
                        <>
                            {/* ── Grupo: TEXTO — Click = seleccionar, H1+/H2+/H3+ = agregar más ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 10px', borderRight: '1px solid #e9ecef', gap: '2px' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {/* H1 + botón agregar */}
                                    {[{ id: 'title', icon: 'bi-type-h1', label: 'H1', title: 'Título H1', color: '#5b2ea6', size: '1.1rem', addKey: 'title', defaultText: 'TÍTULO PRINCIPAL' },
                                    { id: 'title2', icon: 'bi-type-h2', label: 'H2', title: 'Subtítulo H2', color: '#7c3aed', size: '0.9rem', addKey: 'title2', defaultText: 'Subtítulo' },
                                    { id: 'title3', icon: 'bi-type-h3', label: 'H3', title: 'Línea 3 H3', color: '#9f67ff', size: '0.78rem', addKey: 'title3', defaultText: 'Línea 3' },
                                    ].map(el => {
                                        const active = selectedElementId === el.id;
                                        const hasContent = !!formData[el.addKey];
                                        return (
                                            <div key={el.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => setSelectedElementId(el.id)}
                                                    title={el.title}
                                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: `2px solid ${active ? '#5b2ea6' : '#e9ecef'}`, borderRadius: '8px', background: active ? '#ede9fe' : '#f8f9fa', cursor: 'pointer', gap: '1px' }}>
                                                    <i className={`bi ${el.icon}`} style={{ fontSize: el.size, color: active ? '#5b2ea6' : el.color }}></i>
                                                    <span style={{ fontSize: '0.5rem', fontWeight: 700, color: active ? '#5b2ea6' : el.color, lineHeight: 1 }}>{el.label}</span>
                                                </button>
                                                {/* Botón + agregar texto */}
                                                <button
                                                    onClick={() => { if (!hasContent) set(el.addKey, el.defaultText); setSelectedElementId(el.id); }}
                                                    title={hasContent ? `Editar ${el.label}` : `Agregar ${el.label}`}
                                                    style={{ width: '20px', height: '14px', border: `1px solid ${hasContent ? '#10b981' : '#dee2e6'}`, borderRadius: '4px', background: hasContent ? '#d1fae5' : '#f8f9fa', color: hasContent ? '#059669' : '#888', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                                    {hasContent ? '✓' : '+'}
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Botones simples sin sub-botón */}
                                    {[
                                        { id: 'speaker', icon: 'bi-person-fill', label: '', title: 'Orador', color: '#374151' },
                                        { id: 'tag', icon: 'bi-tag-fill', label: '', title: 'Etiqueta — clic para editar', color: '#2563eb', action: () => setShowTagEditor(true) },
                                        { id: 'date', icon: 'bi-calendar3', label: '', title: 'Fecha — clic para abrir calendario', color: '#059669', action: () => setShowDatePicker(true) },
                                        { id: 'time', icon: 'bi-clock-fill', label: '', title: 'Hora — clic para abrir reloj', color: '#d97706', action: () => setShowClockPicker(true) },
                                        { id: 'location', icon: 'bi-geo-alt-fill', label: '', title: 'Lugar', color: '#dc2626' },
                                    ].map(el => {
                                        const active = selectedElementId === el.id;
                                        return (
                                            <button key={el.id}
                                                onClick={() => { setSelectedElementId(el.id); el.action?.(); }}
                                                title={el.title}
                                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: `2px solid ${active ? '#5b2ea6' : '#e9ecef'}`, borderRadius: '8px', background: active ? '#ede9fe' : '#f8f9fa', cursor: 'pointer', gap: '1px', flexShrink: 0 }}>
                                                <i className={`bi ${el.icon}`} style={{ fontSize: '1rem', color: active ? '#5b2ea6' : el.color }}></i>
                                            </button>
                                        );
                                    })}
                                </div>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>Texto</span>
                            </div>

                            {/* ── Grupo: LOGOS ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 10px', borderRight: '1px solid #e9ecef', gap: '2px' }}>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>

                                    {/* IASD — icono dentro de rectángulo */}
                                    <button
                                        onClick={() => set('showLogoIasd', !formData.showLogoIasd)}
                                        title="Logo Iglesia Adventista"
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '48px', height: '40px', border: `2px solid ${formData.showLogoIasd ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '8px', background: formData.showLogoIasd ? '#ede9fe' : '#f8f9fa', cursor: 'pointer', gap: '2px' }}>
                                        <i className="bi bi-church" style={{ fontSize: '1.1rem', color: formData.showLogoIasd ? '#5b2ea6' : '#374151' }}></i>
                                        <span style={{ fontSize: '0.45rem', fontWeight: 700, color: formData.showLogoIasd ? '#5b2ea6' : '#666', lineHeight: 1 }}>IASD</span>
                                    </button>

                                    {/* Logo Oasis */}
                                    <button
                                        onClick={() => set('showLogoOasis', !formData.showLogoOasis)}
                                        title="Logo Oasis"
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '48px', height: '40px', border: `2px solid ${formData.showLogoOasis ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '8px', background: formData.showLogoOasis ? '#ede9fe' : '#f8f9fa', cursor: 'pointer', padding: '2px' }}>
                                        <img src={logoOasis} style={{ height: '22px', objectFit: 'contain', filter: formData.showLogoOasis ? 'none' : 'grayscale(0.5)' }} alt="Oasis" />
                                    </button>

                                    {/* RRSS Oasis */}
                                    <button
                                        onClick={() => set('showRrss', !formData.showRrss)}
                                        title="Redes Sociales Oasis"
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '48px', height: '40px', border: `2px solid ${formData.showRrss ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '8px', background: formData.showRrss ? '#ede9fe' : '#f8f9fa', cursor: 'pointer', padding: '2px' }}>
                                        <img src={rrssImage} style={{ height: '22px', objectFit: 'contain', filter: formData.showRrss ? 'none' : 'grayscale(0.5)' }} alt="RRSS" />
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>Logos</span>
                            </div>

                            {/* ── Grupo: IMAGEN ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 10px', borderRight: '1px solid #e9ecef', gap: '2px' }}>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: '2px dashed #dee2e6', borderRadius: '8px', background: '#f8f9fa', cursor: 'pointer', gap: '1px' }} title="Subir imagen de fondo">
                                        <i className="bi bi-cloud-upload" style={{ fontSize: '1rem', color: '#555' }}></i>
                                        <span style={{ fontSize: '0.45rem', fontWeight: 700, color: '#888' }}>Subir</span>
                                        <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                                    </label>
                                    {formData.bgImage && (
                                        <div style={{ position: 'relative' }}>
                                            <img src={formData.bgImage} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #5b2ea6' }} alt="bg" />
                                            <button onClick={() => setMany({ bgImage: null, bgMode: 'gradient' })} title="Quitar"
                                                style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>Imagen</span>
                            </div>

                            {/* ── Grupo: FORMAS con degradado ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 10px', gap: '2px' }}>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                                    {/* Selector de forma */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', width: '106px' }}>
                                            {[
                                                { shape: 'rect', icon: 'bi-square', title: 'Rectángulo' },
                                                { shape: 'rounded', icon: 'bi-app', title: 'Rect. redondeado' },
                                                { shape: 'circle', icon: 'bi-circle', title: 'Círculo' },
                                                { shape: 'triangle', icon: 'bi-triangle', title: 'Triángulo' },
                                                { shape: 'diamond', icon: 'bi-diamond', title: 'Rombo' },
                                                { shape: 'star', icon: 'bi-star', title: 'Estrella' },
                                                { shape: 'arrow', icon: 'bi-arrow-right-square', title: 'Flecha' },
                                                { shape: 'line', icon: 'bi-dash-lg', title: 'Línea' },
                                            ].map(s => {
                                                const sel = (formData.shapeType || 'rect') === s.shape;
                                                return (
                                                    <button key={s.shape}
                                                        onClick={() => set('shapeType', s.shape)}
                                                        title={s.title}
                                                        style={{ width: '24px', height: '24px', border: `1px solid ${sel ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '4px', background: sel ? '#ede9fe' : '#f8f9fa', color: sel ? '#5b2ea6' : '#555', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className={`bi ${s.icon}`}></i>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {/* Botón modo colocar — toca el canvas para insertar */}
                                        <button
                                            onClick={() => setShapeMode(m => !m)}
                                            style={{ height: '20px', fontSize: '0.6rem', fontWeight: 700, border: `1px solid ${shapeMode ? '#5b2ea6' : '#dee2e6'}`, borderRadius: '4px', background: shapeMode ? '#ede9fe' : '#f8f9fa', color: shapeMode ? '#5b2ea6' : '#555', cursor: 'pointer', padding: '0 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <i className={`bi ${shapeMode ? 'bi-cursor-fill' : 'bi-cursor'}`} style={{ fontSize: '0.7rem' }}></i>
                                            {shapeMode ? 'Toca canvas…' : 'Colocar aquí'}
                                        </button>
                                    </div>
                                    {/* Controles de degradado */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderLeft: '1px solid #e9ecef', paddingLeft: '8px' }}>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            <input type="color" value={formData.shapeGradFrom || '#5b2ea6'} onChange={e => set('shapeGradFrom', e.target.value)}
                                                style={{ width: '22px', height: '22px', padding: '0', border: '1px solid #dee2e6', borderRadius: '4px', cursor: 'pointer' }} title="Color inicio" />
                                            <span style={{ fontSize: '0.55rem', color: '#888' }}>→</span>
                                            <input type="color" value={formData.shapeGradTo || '#a78bfa'} onChange={e => set('shapeGradTo', e.target.value)}
                                                style={{ width: '22px', height: '22px', padding: '0', border: '1px solid #dee2e6', borderRadius: '4px', cursor: 'pointer' }} title="Color final" />
                                        </div>
                                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.55rem', color: '#888', width: '16px' }}>⬛</span>
                                            <input type="range" min="0" max="360" value={formData.shapeGradAngle || 135} onChange={e => set('shapeGradAngle', parseInt(e.target.value))}
                                                style={{ width: '56px', height: '4px' }} title="Ángulo" />
                                            <span style={{ fontSize: '0.55rem', color: '#888', width: '24px' }}>{formData.shapeGradAngle || 135}°</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.55rem', color: '#888', width: '16px' }}>↔</span>
                                            <input type="range" min="20" max="300" value={formData.shapeSize || 80} onChange={e => set('shapeSize', parseInt(e.target.value))}
                                                style={{ width: '56px', height: '4px' }} title="Tamaño" />
                                            <span style={{ fontSize: '0.55rem', color: '#888', width: '28px' }}>{formData.shapeSize || 80}px</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const shapes = [...(formData.shapes || []), {
                                                    id: Date.now(), type: formData.shapeType || 'rect',
                                                    gradFrom: formData.shapeGradFrom || '#5b2ea6',
                                                    gradTo: formData.shapeGradTo || '#a78bfa',
                                                    angle: formData.shapeGradAngle || 135,
                                                    size: formData.shapeSize || 80, x: 50, y: 50,
                                                }];
                                                set('shapes', shapes);
                                            }}
                                            style={{ height: '20px', fontSize: '0.6rem', fontWeight: 700, border: 'none', borderRadius: '4px', background: '#5b2ea6', color: '#fff', cursor: 'pointer', padding: '0 8px' }}>
                                            + Centro
                                        </button>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>Formas</span>
                            </div>
                        </>
                    )}

                    {/* ═══════ DISEÑO ═══════ */}
                    {activeRibbonTab === 'diseño' && (
                        <>
                            {/* Grupo: PLANTILLAS */}
                            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 10px', borderRight: '1px solid #e9ecef', gap: '2px' }}>
                                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '420px', paddingBottom: '2px' }}>
                                    {TEMPLATES.map(tpl => (
                                        <button
                                            key={tpl.id}
                                            onClick={() => applyTemplate(tpl)}
                                            style={{
                                                flexShrink: 0,
                                                width: '62px', height: '70px',
                                                background: `linear-gradient(135deg, ${tpl.gradientStart}, ${tpl.gradientEnd})`,
                                                border: '2px solid #ddd', borderRadius: '8px',
                                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'flex-end',
                                                padding: '4px', gap: '2px', transition: 'transform 0.1s',
                                            }}
                                            title={tpl.name}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <span style={{ fontSize: '0.45rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', padding: '1px 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '58px' }}>{tpl.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>Plantillas</span>
                            </div>

                            {/* Grupo: FONDO */}
                            <div className="d-flex flex-column px-3 border-end">
                                <span className="small text-muted mb-1" style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Fondo</span>
                                <div className="d-flex gap-1 align-items-center">
                                    <input type="color" className="form-control form-control-color p-0" style={{ width: 28, height: 28, border: '2px solid #ddd', borderRadius: '4px' }} value={formData.gradientStart} onChange={e => set('gradientStart', e.target.value)} title="Color inicial" />
                                    <input type="color" className="form-control form-control-color p-0" style={{ width: 28, height: 28, border: '2px solid #ddd', borderRadius: '4px' }} value={formData.gradientEnd} onChange={e => set('gradientEnd', e.target.value)} title="Color final" />
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setMany({ gradientStart: '#5b2ea6', gradientEnd: '#16213e' })} title="Colores Oasis">
                                        <i className="bi bi-stars"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Grupo: GALERÍA RÁPIDA */}
                            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 10px', borderRight: '1px solid #e9ecef', gap: '2px' }}>
                                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '340px', paddingBottom: '2px' }}>
                                    {['https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&q=80',
                                        'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=80',
                                        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80',
                                        'https://images.unsplash.com/photo-1514632595-4944383f2737?w=400&q=80',
                                        'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&q=80',
                                        'https://images.unsplash.com/photo-1499209974431-2761e25236d0?w=400&q=80',
                                    ].map((img, i) => (
                                        <img key={i} src={img} onClick={() => handleSelectStock(img)}
                                            style={{ width: '58px', height: '68px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid #ddd', flexShrink: 0, transition: 'transform 0.1s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            alt="stock" />
                                    ))}
                                    <button onClick={() => setShowLibrary(true)}
                                        style={{ width: '58px', height: '68px', flexShrink: 0, border: '2px dashed #dee2e6', borderRadius: '8px', background: '#f8f9fa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: '#888' }}
                                        title="Ver más">
                                        <i className="bi bi-plus-circle" style={{ fontSize: '1.2rem' }}></i>
                                        <span style={{ fontSize: '0.5rem', fontWeight: 600 }}>Más</span>
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', textAlign: 'center' }}>Imágenes</span>
                            </div>

                            {/* Grupo: MEZCLA */}
                            {formData.bgImage && (
                                <div className="d-flex flex-column px-3">
                                    <span className="small text-muted mb-1" style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Mezcla</span>
                                    <div className="d-flex gap-1 align-items-center">
                                        <input type="checkbox" checked={formData.blendGradient} onChange={e => set('blendGradient', e.target.checked)} id="ribbonBlend" />
                                        <input type="range" className="form-range" style={{ width: '60px' }} min="0" max="1" step="0.05"
                                            value={formData.blendOpacity} onChange={e => set('blendOpacity', parseFloat(e.target.value))}
                                            disabled={!formData.blendGradient} />
                                        <span className="small">{Math.round(formData.blendOpacity * 100)}%</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ═══════ FORMATO ═══════ */}
                    {activeRibbonTab === 'formato' && (
                        <>
                            {/* Grupo: Posición */}
                            <div className="d-flex flex-column align-items-center px-3 border-end">
                                <div className="d-flex flex-column gap-1 mb-1">
                                    <div className="d-flex gap-1">
                                        <span className="small me-1" style={{ width: '20px' }}>X:</span>
                                        <input
                                            type="range"
                                            className="form-range"
                                            style={{ width: '80px' }}
                                            min="-50" max="50"
                                            value={formData[`${target}Pos`]?.x || 0}
                                            onChange={e => set(`${target}Pos`, { ...formData[`${target}Pos`], x: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="d-flex gap-1">
                                        <span className="small me-1" style={{ width: '20px' }}>Y:</span>
                                        <input
                                            type="range"
                                            className="form-range"
                                            style={{ width: '80px' }}
                                            min="-50" max="50"
                                            value={formData[`${target}Pos`]?.y || 0}
                                            onChange={e => set(`${target}Pos`, { ...formData[`${target}Pos`], y: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Posición</span>
                            </div>

                            {/* Grupo: Opacidad */}
                            <div className="d-flex flex-column align-items-center px-3 border-end">
                                <div className="d-flex gap-1 align-items-center mb-1">
                                    <input
                                        type="range"
                                        className="form-range"
                                        style={{ width: '80px' }}
                                        min="0" max="100"
                                        value={formData[`${target}Opacity`] || 100}
                                        onChange={e => set(`${target}Opacity`, parseInt(e.target.value))}
                                    />
                                    <span className="small" style={{ minWidth: '30px' }}>{formData[`${target}Opacity`] || 100}%</span>
                                </div>
                                <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Opacidad</span>
                            </div>

                            {/* Grupo: Vista */}
                            <div className="d-flex flex-column align-items-center px-3">
                                <div className="d-flex gap-2 mb-1">
                                    <button onClick={handleFullscreen} className="btn btn-light" title="Pantalla Completa">
                                        <i className="bi bi-arrows-fullscreen"></i>
                                    </button>
                                    <button onClick={() => setSelectedElementId(null)} className="btn btn-light" title="Deseleccionar">
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                                <span className="small text-muted" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Vista</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };



    return (
        <div className="canva-container d-flex flex-column" style={{ position: 'relative', minHeight: '80vh', width: '100%', background: '#f4f7f8', overflow: 'hidden' }}>
            <FontPreloader />

            {/* ── Header: solo el selector de modo ── */}
            <header className="d-flex align-items-center px-3 bg-white border-bottom flex-shrink-0" style={{ height: '36px', minHeight: '36px', gap: '8px' }}>
                <img src={logoOasis} style={{ height: '22px', cursor: 'pointer' }} alt="Oasis" onClick={() => navigate('/admin')} title="Volver al inicio" />
                <div style={{ width: '1px', height: '16px', background: '#ddd' }} />
                <div className="nav nav-pills p-0" style={{ background: '#f8f9fa', borderRadius: '20px', padding: '2px', fontSize: '0.7rem' }}>
                    <button
                        className="nav-link rounded-pill px-3 py-1 fw-semibold"
                        style={{ fontSize: '0.7rem', background: activeMode === 'anuncios' ? '#5b2ea6' : 'transparent', color: activeMode === 'anuncios' ? 'white' : '#666', border: 'none', cursor: 'pointer' }}
                        onClick={() => setActiveMode('anuncios')}
                    >Anuncios</button>
                    <button
                        className="nav-link rounded-pill px-3 py-1 fw-semibold"
                        style={{ fontSize: '0.7rem', background: activeMode === 'presentaciones' ? '#5b2ea6' : 'transparent', color: activeMode === 'presentaciones' ? 'white' : '#666', border: 'none', cursor: 'pointer' }}
                        onClick={() => setActiveMode('presentaciones')}
                    >Presentaciones</button>
                </div>
            </header>

            {/* Ribbon Menu */}
            {activeMode === 'anuncios' && renderRibbon()}

            {/* Main Workspace */}
            <div className="canva-workspace" style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: '1 1 0%', minHeight: 0, overflow: 'hidden' }}>
                <main
                    className="workspace-body"
                    style={{
                        flex: '1 1 0%',
                        minHeight: 0,
                        overflowY: 'auto',
                        background: '#e9ecef',
                        position: 'relative',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setSelectedElementId(null);
                    }}
                    onClick={(e) => {
                        // Colocar forma en la posici\u00f3n donde se toc\u00f3/clic\u00f3 el canvas
                        if (!shapeMode || !previewRef.current) return;
                        const rect = previewRef.current.getBoundingClientRect();
                        const px = ((e.clientX - rect.left) / rect.width) * 100;
                        const py = ((e.clientY - rect.top) / rect.height) * 100;
                        set('shapes', [...(formData.shapes || []), {
                            id: Date.now(), type: formData.shapeType || 'rect',
                            gradFrom: formData.shapeGradFrom || '#5b2ea6',
                            gradTo: formData.shapeGradTo || '#a78bfa',
                            angle: formData.shapeGradAngle || 135,
                            size: formData.shapeSize || 80,
                            x: Math.max(5, Math.min(95, px)),
                            y: Math.max(5, Math.min(95, py)),
                        }]);
                        setShapeMode(false);
                    }}
                    onTouchEnd={(e) => {
                        if (!shapeMode || !previewRef.current) return;
                        const touch = e.changedTouches[0];
                        const rect = previewRef.current.getBoundingClientRect();
                        const px = ((touch.clientX - rect.left) / rect.width) * 100;
                        const py = ((touch.clientY - rect.top) / rect.height) * 100;
                        set('shapes', [...(formData.shapes || []), {
                            id: Date.now(), type: formData.shapeType || 'rect',
                            gradFrom: formData.shapeGradFrom || '#5b2ea6',
                            gradTo: formData.shapeGradTo || '#a78bfa',
                            angle: formData.shapeGradAngle || 135,
                            size: formData.shapeSize || 80,
                            x: Math.max(5, Math.min(95, px)),
                            y: Math.max(5, Math.min(95, py)),
                        }]);
                        setShapeMode(false);
                    }}
                >
                    {activeMode === 'presentaciones' ? (
                        <div className="w-100 h-100"><OasisPress /></div>
                    ) : (
                        <>
                            {/* Canvas Area - Perfectly Centered */}
                            <div
                                className="canvas-wrapper"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    minHeight: 0,
                                    perspective: '1000px'
                                }}
                            >

                                <motion.div
                                    layout
                                    ref={previewRef}
                                    id="preview-container"
                                    style={{
                                        width: formData.format === 'whatsapp' ? '260px' : (formData.format === 'youtube' ? '560px' : '340px'),
                                        maxWidth: isMobile ? '85vw' : '45vw',
                                        maxHeight: '78vh',
                                        aspectRatio: currentFmt.aspect,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        ...previewBgStyle,
                                        cursor: shapeMode ? 'crosshair' : 'default',
                                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4), 0 18px 36px -18px rgba(0,0,0,0.5)',
                                        borderRadius: '4px',
                                        containerType: 'inline-size',
                                        touchAction: 'none',
                                        outline: shapeMode ? '3px dashed #5b2ea6' : 'none',
                                    }}
                                >
                                    {/* Dark Overlay */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)', opacity: formData.bgOpacity, pointerEvents: 'none' }} />

                                    {/* BRANDING (Fixed Corners) */}
                                    {formData.showLogoIasd && assets.iasd && (
                                        <div
                                            onMouseDown={() => setSelectedElementId('logoIasd')}
                                            onTouchStart={() => setSelectedElementId('logoIasd')}
                                            onDoubleClick={() => handleElementDoubleClick('logoIasd')}
                                            style={{
                                                position: 'absolute', top: '5%', left: '5%', cursor: 'pointer',
                                                outline: selectedElementId === 'logoIasd' ? '2px dashed #00d2f3' : 'none',
                                                outlineOffset: '4px', borderRadius: '4px', zIndex: 10
                                            }}
                                        >
                                            <img src={assets.iasd} style={{ height: `${formData.logoIasdSize}px`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        </div>
                                    )}
                                    {formData.showLogoOasis && assets.oasis && (
                                        <div
                                            onMouseDown={() => setSelectedElementId('logoOasis')}
                                            onTouchStart={() => setSelectedElementId('logoOasis')}
                                            onDoubleClick={() => handleElementDoubleClick('logoOasis')}
                                            style={{
                                                position: 'absolute', top: '4%', right: '5%', cursor: 'pointer',
                                                outline: selectedElementId === 'logoOasis' ? '2px dashed #00d2f3' : 'none',
                                                outlineOffset: '4px', borderRadius: '4px', zIndex: 10
                                            }}
                                        >
                                            <img src={assets.oasis} style={{ height: `${formData.logoOasisSize}px`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        </div>
                                    )}
                                    {formData.showRrss && assets.rrss && (
                                        <div
                                            onMouseDown={() => setSelectedElementId('rrss')}
                                            onTouchStart={() => setSelectedElementId('rrss')}
                                            onDoubleClick={() => handleElementDoubleClick('rrss')}
                                            style={{
                                                position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer',
                                                outline: selectedElementId === 'rrss' ? '2px dashed #00d2f3' : 'none',
                                                outlineOffset: '4px', borderRadius: '4px', zIndex: 10
                                            }}
                                        >
                                            <img src={assets.rrss} style={{ height: `${formData.rrssSize}px`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        </div>
                                    )}

                                    {/* INTERACTIVE CONTENT WITH FRAMER MOTION */}
                                    <div className="p-4 d-flex flex-column justify-content-center" style={{ position: 'absolute', inset: 0, zIndex: 5 }}>

                                        {/* TAG */}
                                        <motion.div
                                            drag
                                            dragMomentum={false}
                                            onMouseDown={() => setSelectedElementId('tag')}
                                            onTouchStart={() => setSelectedElementId('tag')}
                                            onDoubleClick={() => handleElementDoubleClick('tag')}
                                            style={{
                                                x: formData.tagPos.x, y: formData.tagPos.y, cursor: 'move', alignSelf: 'center', marginBottom: '10px',
                                                outline: selectedElementId === 'tag' ? '2px dashed #00d2f3' : 'none',
                                                outlineOffset: '4px',
                                                borderRadius: '4px'
                                            }}
                                            onDragEnd={(e, info) => set('tagPos', { x: formData.tagPos.x + info.offset.x, y: formData.tagPos.y + info.offset.y })}
                                        >
                                            <div ref={tagRef} style={{ opacity: formData.tagOpacity / 100 }}>
                                                {formData.tagStyle === 'pill-translucent' ? (
                                                    <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: formData.tagColor, padding: '4px 15px', borderRadius: '50px', fontSize: `calc(${formData.tagSize * 2}cqw + 1cqw)`, fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.3)', fontFamily: formData.tagFont }}>{formData.tag}</span>
                                                ) : formData.tagStyle === 'outline' ? (
                                                    <span style={{ border: `2px solid ${formData.tagColor}`, color: formData.tagColor, padding: '4px 15px', borderRadius: '4px', fontSize: `calc(${formData.tagSize * 2}cqw + 1cqw)`, fontWeight: 'bold', fontFamily: formData.tagFont }}>{formData.tag}</span>
                                                ) : formData.tagStyle === 'ghost' ? (
                                                    <span style={{ color: formData.tagColor, fontSize: `calc(${formData.tagSize * 2}cqw + 1.5cqw)`, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: formData.tagFont }}>{formData.tag}</span>
                                                ) : (
                                                    <span style={{ background: formData.tagBgColor, color: formData.tagColor, padding: '4px 15px', borderRadius: '4px', fontSize: `calc(${formData.tagSize * 2}cqw + 1cqw)`, fontWeight: 'bold', fontFamily: formData.tagFont }}>{formData.tag}</span>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* TITLES */}
                                        <div className="mt-2 text-center w-100">
                                            <motion.div drag dragMomentum={false}
                                                onMouseDown={() => setSelectedElementId('title')}
                                                onTouchStart={() => setSelectedElementId('title')}
                                                onDoubleClick={() => handleElementDoubleClick('title')}
                                                style={{
                                                    x: formData.titlePos.x, y: formData.titlePos.y, cursor: 'move',
                                                    outline: selectedElementId === 'title' ? '2px dashed #00d2f3' : 'none',
                                                    outlineOffset: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                onDragEnd={(e, info) => set('titlePos', { x: formData.titlePos.x + info.offset.x, y: formData.titlePos.y + info.offset.y })}
                                            >
                                                <h2 ref={titleRef} style={{ color: formData.titleColor, fontFamily: formData.titleFont, fontSize: `calc(${formData.titleSize * 3}cqw + 1cqw)`, fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1.1, margin: 0, opacity: formData.titleOpacity / 100 }}>{formData.title || 'Título'}</h2>
                                            </motion.div>

                                            <motion.div drag dragMomentum={false}
                                                onMouseDown={() => setSelectedElementId('title2')}
                                                onTouchStart={() => setSelectedElementId('title2')}
                                                onDoubleClick={() => handleElementDoubleClick('title2')}
                                                style={{
                                                    x: formData.title2Pos.x, y: formData.title2Pos.y, cursor: 'move', marginTop: '10px',
                                                    outline: selectedElementId === 'title2' ? '2px dashed #00d2f3' : 'none',
                                                    outlineOffset: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                onDragEnd={(e, info) => set('title2Pos', { x: formData.title2Pos.x + info.offset.x, y: formData.title2Pos.y + info.offset.y })}
                                            >
                                                <h4 ref={title2Ref} style={{ color: formData.title2Color, fontFamily: formData.title2Font, fontSize: `calc(${formData.title2Size * 3}cqw + 1cqw)`, fontWeight: '400', opacity: formData.title2Opacity / 100, margin: 0 }}>{formData.title2}</h4>
                                            </motion.div>

                                            {/* TITLE3 - Tercer subtítulo */}
                                            {formData.title3 && (
                                                <motion.div drag dragMomentum={false}
                                                    onMouseDown={() => setSelectedElementId('title3')}
                                                    onTouchStart={() => setSelectedElementId('title3')}
                                                    onDoubleClick={() => handleElementDoubleClick('title3')}
                                                    style={{
                                                        x: formData.title3Pos.x, y: formData.title3Pos.y, cursor: 'move', marginTop: '8px',
                                                        outline: selectedElementId === 'title3' ? '2px dashed #00d2f3' : 'none',
                                                        outlineOffset: '4px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onDragEnd={(e, info) => set('title3Pos', { x: formData.title3Pos.x + info.offset.x, y: formData.title3Pos.y + info.offset.y })}
                                                >
                                                    <h5 ref={title3Ref} style={{ color: formData.title3Color, fontFamily: formData.title3Font, fontSize: `calc(${formData.title3Size * 3}cqw + 0.8cqw)`, fontWeight: '400', opacity: formData.title3Opacity / 100, margin: 0 }}>{formData.title3}</h5>
                                                </motion.div>
                                            )}

                                            <motion.div drag dragMomentum={false}
                                                onMouseDown={() => setSelectedElementId('speaker')}
                                                onTouchStart={() => setSelectedElementId('speaker')}
                                                onDoubleClick={() => handleElementDoubleClick('speaker')}
                                                style={{
                                                    x: formData.speakerPos.x, y: formData.speakerPos.y, cursor: 'move', marginTop: '15px',
                                                    outline: selectedElementId === 'speaker' ? '2px dashed #00d2f3' : 'none',
                                                    outlineOffset: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                onDragEnd={(e, info) => set('speakerPos', { x: formData.speakerPos.x + info.offset.x, y: formData.speakerPos.y + info.offset.y })}
                                            >
                                                <div ref={speakerRef} style={{ color: formData.speakerColor, fontFamily: formData.speakerFont, fontSize: `calc(${formData.speakerSize * 3}cqw + 1.5cqw)`, opacity: formData.speakerOpacity / 100 }}>{formData.speaker}</div>
                                            </motion.div>
                                        </div>

                                        {/* DESCRIPTION */}
                                        {formData.content && (
                                            <motion.div
                                                drag dragMomentum={false}
                                                onMouseDown={() => setSelectedElementId('content')}
                                                onTouchStart={() => setSelectedElementId('content')}
                                                onDoubleClick={() => handleElementDoubleClick('content')}
                                                style={{
                                                    x: formData.contentPos.x, y: formData.contentPos.y, cursor: 'move', marginTop: '20px', alignSelf: 'center',
                                                    outline: selectedElementId === 'content' ? '2px dashed #00d2f3' : 'none',
                                                    outlineOffset: '4px',
                                                    borderRadius: '16px'
                                                }}
                                                onDragEnd={(e, info) => set('contentPos', { x: formData.contentPos.x + info.offset.x, y: formData.contentPos.y + info.offset.y })}
                                            >
                                                <div ref={contentRef} className={`content-box pattern-${formData.contentPattern}`} style={{
                                                    textAlign: 'center', padding: '12px 20px',
                                                    background: formData.contentStyle === 'biblical' ? `rgba(255,255,255,${formData.contentBgOpacity})` : 'transparent',
                                                    backdropFilter: formData.contentStyle === 'biblical' ? 'blur(4px)' : 'none',
                                                    borderRadius: '16px', maxWidth: '300px',
                                                    position: 'relative', overflow: 'hidden'
                                                }}>
                                                    <p style={{ color: 'white', fontSize: `calc(${formData.contentSize * 3}cqw + 1cqw)`, margin: 0, lineHeight: 1.4, fontFamily: formData.contentFont, position: 'relative', zIndex: 2 }}>{formData.content}</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* INFO PILLS */}
                                        <div className="mt-auto pb-4 d-flex flex-wrap justify-content-center gap-2">
                                            {(formData.date || formData.time) && (
                                                <motion.div
                                                    drag dragMomentum={false}
                                                    onMouseDown={() => setSelectedElementId('date')}
                                                    onTouchStart={() => setSelectedElementId('date')}
                                                    style={{
                                                        x: formData.datePos.x, y: formData.datePos.y, cursor: 'move',
                                                        outline: selectedElementId === 'date' ? '2px dashed #00d2f3' : 'none',
                                                        outlineOffset: '4px', borderRadius: '30px'
                                                    }}
                                                    onDragEnd={(e, info) => set('datePos', { x: formData.datePos.x + info.offset.x, y: formData.datePos.y + info.offset.y })}
                                                >
                                                    <div ref={dateRef} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '5px 15px', borderRadius: '30px', color: formData.dateColor || 'white', fontSize: `calc(${formData.dateSize * 3}cqw)`, whiteSpace: 'nowrap', fontFamily: formData.dateFont, opacity: formData.dateOpacity / 100 }}>
                                                        <i className={`bi ${formData.date ? 'bi-calendar3' : 'bi-clock'} me-2`}></i>
                                                        {[formData.date ? new Date(formData.date + 'T00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : '', formData.time].filter(Boolean).join(' - ')}
                                                    </div>
                                                </motion.div>
                                            )}
                                            {formData.location && (
                                                <motion.div
                                                    drag dragMomentum={false}
                                                    onMouseDown={() => setSelectedElementId('location')}
                                                    onTouchStart={() => setSelectedElementId('location')}
                                                    style={{
                                                        x: formData.locationPos.x, y: formData.locationPos.y, cursor: 'move',
                                                        outline: selectedElementId === 'location' ? '2px dashed #00d2f3' : 'none',
                                                        outlineOffset: '4px', borderRadius: '30px'
                                                    }}
                                                    onDragEnd={(e, info) => set('locationPos', { x: formData.locationPos.x + info.offset.x, y: formData.locationPos.y + info.offset.y })}
                                                >
                                                    <div ref={locationRef} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '5px 15px', borderRadius: '30px', color: formData.locationColor || 'white', fontSize: `calc(${formData.locationSize * 3}cqw)`, whiteSpace: 'nowrap', fontFamily: formData.locationFont || 'AdventSans', opacity: formData.locationOpacity / 100 }}>
                                                        <i className="bi bi-geo-alt me-2"></i>
                                                        {formData.location}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ══════════════════════════════════
                                        INLINE TEXT EDITOR OVERLAY
                                        Double-click any element to edit.
                                    ══════════════════════════════════ */}
                                    {editingElement && (
                                        <div
                                            style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
                                            onClick={(e) => { if (e.target === e.currentTarget) commitEdit(); }}
                                        >
                                            <div style={{ width: '88%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ background: 'rgba(91,46,166,0.95)', borderRadius: '10px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <i className="bi bi-pencil-fill" style={{ color: '#fff', fontSize: '0.8rem' }}></i>
                                                    <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        {editingElement}
                                                    </span>
                                                    <button onClick={() => setEditingElement(null)}
                                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '4px', padding: '0 6px', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                                                </div>
                                                <textarea
                                                    autoFocus
                                                    value={editingValue}
                                                    onChange={e => setEditingValue(e.target.value)}
                                                    onFocus={e => e.target.select()}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
                                                        if (e.key === 'Escape') setEditingElement(null);
                                                    }}
                                                    onBlur={commitEdit}
                                                    rows={editingElement === 'content' ? 4 : 2}
                                                    placeholder="Escribe aquí..."
                                                    style={{
                                                        width: '100%', resize: 'none', border: '2px solid #5b2ea6',
                                                        borderRadius: '10px', padding: '12px 14px',
                                                        fontSize: editingElement === 'title' ? '1.1rem' : '0.9rem',
                                                        fontWeight: ['title', 'title2', 'title3'].includes(editingElement) ? 700 : 500,
                                                        background: 'rgba(255,255,255,0.97)',
                                                        color: '#1f1f2e', outline: 'none',
                                                        textAlign: 'center', fontFamily: 'sans-serif',
                                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                    }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => setEditingElement(null)}
                                                        style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', color: '#555' }}>
                                                        Esc — Cancelar
                                                    </button>
                                                    <button onClick={commitEdit}
                                                        style={{ background: '#5b2ea6', border: 'none', borderRadius: '8px', padding: '6px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', color: '#fff' }}>
                                                        ✓ Aplicar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* ── Quick-edit bar below the canvas ── */}
                                {selectedFieldKey && !editingElement && (
                                    <div style={{
                                        marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'rgba(31,31,46,0.92)', borderRadius: '12px',
                                        padding: '6px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                        minWidth: '240px', maxWidth: '360px', width: '100%',
                                    }}>
                                        <i className="bi bi-pencil-fill" style={{ color: '#a78bfa', fontSize: '0.75rem', flexShrink: 0 }}></i>
                                        <input
                                            type="text"
                                            value={formData[selectedFieldKey] || ''}
                                            onChange={e => set(selectedFieldKey, e.target.value)}
                                            placeholder={`✏ ${selectedElementId}…`}
                                            style={{
                                                flex: 1, border: 'none', background: 'transparent',
                                                color: '#fff', fontSize: '0.78rem', fontWeight: 600,
                                                outline: 'none', minWidth: 0,
                                            }}
                                        />
                                        <button onClick={() => handleElementDoubleClick(selectedElementId)}
                                            title="Editar en canvas"
                                            style={{ background: '#5b2ea6', border: 'none', borderRadius: '6px', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className="bi bi-pencil" style={{ color: '#fff', fontSize: '0.6rem' }}></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>

                {/* Side Panel: Mis Anuncios (Right Drawer) */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="announcements-list-drawer bg-white border-start shadow-lg"
                            style={{
                                position: 'fixed',
                                top: activeMode === 'anuncios' ? '140px' : '40px',
                                right: 0,
                                bottom: 0,
                                width: isMobile ? '100%' : '280px',
                                zIndex: 1150,
                                overflowY: 'auto',
                                borderRadius: '0'
                            }}
                        >
                            <div className="p-2 px-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white">
                                <h6 className="fw-bold mb-0" style={{ fontSize: '0.8rem' }}>MIS ANUNCIOS</h6>
                                <button className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setShowForm(false)}></button>
                            </div>
                            <div className="p-0">
                                {announcements.length === 0 ? (
                                    <div className="text-center text-muted py-4" style={{ fontSize: '0.75rem' }}>No hay anuncios guardados</div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {announcements.map(ann => {
                                            const imgUrl = (ann.imageUrl || ann.image_url)
                                                ? ((ann.imageUrl || ann.image_url).startsWith('http')
                                                    ? (ann.imageUrl || ann.image_url)
                                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${ann.imageUrl || ann.image_url}`)
                                                : null;
                                            return (
                                                <div key={ann.id} className="list-group-item d-flex align-items-center justify-content-between py-2 px-2 border-bottom">
                                                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                                                        <img
                                                            src={imgUrl || logoOasis}
                                                            className="rounded shadow-sm flex-shrink-0"
                                                            style={{ width: '40px', height: '50px', objectFit: 'cover', border: '1px solid #e9ecef', borderRadius: '4px' }}
                                                            alt={ann.title}
                                                        />
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div className="fw-semibold text-truncate" style={{ fontSize: '0.7rem' }}>{ann.title || 'Sin título'}</div>
                                                            <span className="badge" style={{ fontSize: '0.5rem', background: theme.colors.primary, color: 'white' }}>{ann.tag}</span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-1 flex-shrink-0">
                                                        <button
                                                            className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                                                            style={{ width: '26px', height: '26px', borderRadius: '4px', fontSize: '0.65rem' }}
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(ann); }}
                                                            title="Editar anuncio"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                                                            style={{ width: '26px', height: '26px', borderRadius: '4px', fontSize: '0.65rem' }}
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }}
                                                            title="Eliminar anuncio"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Library Modal */}
            {showLibrary && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLibrary(false)}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between mb-4"><h5 className="fw-bold">Biblioteca Oasis</h5><button className="btn btn-close" onClick={() => setShowLibrary(false)}></button></div>
                        {Object.entries(STOCK_CATEGORIES).map(([cat, imgs]) => (
                            <div key={cat} className="mb-4">
                                <h6 className="text-muted text-uppercase x-small fw-bold mb-3">{cat}</h6>
                                <div className="row g-2">{imgs.map((img, i) => (
                                    <div key={i} className="col-4 col-md-3"><img src={img} onClick={() => handleSelectStock(img)} className="img-fluid rounded-3 cursor-pointer hover-scale" style={{ height: '100px', width: '100%', objectFit: 'cover' }} /></div>
                                ))}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            <style>{`
                    .scrollbar-custom::-webkit-scrollbar { width: 6px; }
                    .scrollbar-custom::-webkit-scrollbar-track { background: #f1f1f1; }
                    .scrollbar-custom::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
                    .letter-spacing-1 { letter-spacing: 1px; }
                    .x-small { font-size: 0.7rem; }
                    .cursor-pointer { cursor: pointer; }
                    .hover-scale { transition: transform 0.2s; }
                    .hover-scale:hover { transform: scale(1.05); }

                    /* Touch support for Draggable elements */
                    #preview-container .react-draggable {
                        touch-action: none !important;
                        -webkit-user-select: none !important;
                        user-select: none !important;
                        -webkit-touch-callout: none !important;
                    }
                    
                    #preview-container .react-draggable * {
                        touch-action: none !important;
                        -webkit-user-select: none !important;
                        user-select: none !important;
                    }

                    #preview-container:fullscreen {
                        width: 100vw !important;
                        height: 100vh !important;
                        max-width: none !important;
                        border-radius: 0 !important;
                        cursor: default !important;
                        background: black !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                    #preview-container:fullscreen .react-draggable {
                        cursor: default !important;
                    }
                    
                    /* Mobile responsive adjustments */
                    @media (max-width: 991px) {
                        .canva-container {
                            z-index: 1100 !important;
                        }
                        .canva-sidebar {
                            position: fixed !important;
                            bottom: 0;
                            left: 0;
                            width: 100% !important;
                            height: 56px !important;
                            flex-direction: row !important;
                            padding: 0 !important;
                            justify-content: space-around !important;
                            border-right: none !important;
                            border-top: 1px solid rgba(255,255,255,0.1);
                            z-index: 200 !important;
                        }
                        .canva-sidebar .nav-btn {
                            height: 100% !important;
                            margin: 0 !important;
                            font-size: 0.55rem !important;
                        }
                        .canva-sidebar .nav-btn i {
                            font-size: 1.2rem !important;
                        }
                        .canva-sidebar .canva-logo-mini { display: none !important; }
                        
                        .canva-panel {
                            position: fixed !important;
                            bottom: 56px !important;
                            left: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                            max-height: 45vh !important;
                            border-radius: 16px 16px 0 0 !important;
                            border-right: none !important;
                            box-shadow: 0 -10px 30px rgba(0,0,0,0.15) !important;
                            z-index: 150 !important;
                        }
                        .canva-workspace {
                            padding-bottom: 56px !important;
                        }
                        .workspace-body {
                            padding: 0.5rem !important;
                            padding-bottom: 60px !important;
                        }
                        #preview-container {
                            width: 85vw !important;
                            max-width: 320px !important;
                            max-height: 65vh !important;
                            margin: 0 auto !important;
                        }
                        .announcements-list-drawer {
                            top: 40px !important;
                            max-height: none !important;
                        }
                        .ribbon-container .d-flex.flex-wrap {
                            overflow-x: auto !important;
                            flex-wrap: nowrap !important;
                        }
                    }
                    
                    /* Tablet adjustments */
                    @media (min-width: 992px) and (max-width: 1199px) {
                        .canva-panel {
                            width: 280px !important;
                        }
                        #preview-container {
                            max-width: 380px !important;
                            max-height: 72vh !important;
                        }
                    }
                    
                    /* Small desktop */
                    @media (min-width: 1200px) and (max-width: 1399px) {
                        #preview-container {
                            max-width: 420px !important;
                            max-height: 75vh !important;
                        }
                    }

                    /* Theme Overrides */
                    .btn-primary { background-color: #5b2ea6 !important; border-color: #5b2ea6 !important; }
                    .btn-primary:hover { background-color: #4a2487 !important; }
                    .text-primary { color: #5b2ea6 !important; }
                    .active-sidebar-btn { background: rgba(0, 211, 223, 0.2) !important; color: #00d3df !important; border-left: 3px solid #00d3df !important; }
                    @media (max-width: 991px) {
                        .active-sidebar-btn { border-left: none !important; border-top: 3px solid #00d3df !important; }
                    }
                    .left-tools-panel .btn:hover { background: rgba(91, 46, 166, 0.15) !important; transform: scale(1.05); }
                    .quick-access-bar .btn:hover { background: rgba(91, 46, 166, 0.15) !important; transform: scale(1.05); }

                    /* Patterns for Biblical Styles */
                    .content-box.pattern-dots::after {
                        content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
                        background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px);
                        background-size: 10px 10px;
                    }
                    .content-box.pattern-lines::after {
                        content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
                        background: repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 10px);
                    }
                    .content-box.pattern-grain::after {
                        content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
                    }
                `}</style>

            {/* ── Reloj Analógico ── */}
            {showClockPicker && (
                <ClockPickerModal
                    value={formData.time}
                    onChange={(t) => set('time', t)}
                    onClose={() => setShowClockPicker(false)}
                />
            )}

            {/* ── Calendario ── */}
            {showDatePicker && (
                <CalendarPickerModal
                    value={formData.date}
                    onChange={(d) => set('date', d)}
                    onClose={() => setShowDatePicker(false)}
                />
            )}

            {/* ════════════════════════════════
                MODAL: EDITOR DE ETIQUETA
            ════════════════════════════════ */}
            {showTagEditor && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowTagEditor(false); }}>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h6 style={{ margin: 0, fontWeight: 700, color: '#1f1f2e' }}>Editar Etiqueta</h6>
                        <input
                            type="text"
                            value={formData.tag || ''}
                            onChange={(e) => set('tag', e.target.value.toUpperCase())}
                            style={{ border: '2px solid #5b2ea6', borderRadius: '8px', padding: '10px 14px', fontSize: '1rem', fontWeight: 700, letterSpacing: '1px', textAlign: 'center', outline: 'none', textTransform: 'uppercase' }}
                            placeholder="ETIQUETA"
                            autoFocus
                        />
                        {/* Preview del tag */}
                        <div style={{ textAlign: 'center', padding: '8px' }}>
                            <span style={{ background: formData.tagBgColor || '#5b2ea6', color: formData.tagColor || '#fff', padding: '6px 20px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>
                                {formData.tag || 'ETIQUETA'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {['GALA', 'CULTO', 'EVENTO', 'JUVENIL', 'COMUNIÓN', 'BAUTISMO', 'ESPECIAL', 'MÚSICA'].map(t => (
                                <button key={t} onClick={() => set('tag', t)}
                                    style={{ border: '1px solid #dee2e6', borderRadius: '6px', background: formData.tag === t ? '#ede9fe' : '#f8f9fa', color: formData.tag === t ? '#5b2ea6' : '#555', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 600, padding: '3px 8px' }}>
                                    {t}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowTagEditor(false)}
                            style={{ background: '#5b2ea6', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px', fontWeight: 700, cursor: 'pointer' }}>
                            Listo
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminAnnouncements;
