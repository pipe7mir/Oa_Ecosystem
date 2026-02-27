import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../react-ui/styles/theme';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';  // API client for backend requests
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
    { id: 'templates', label: 'Plantillas', icon: 'bi-grid-3x3-gap' },
    { id: 'elements', label: 'Elementos', icon: 'bi-briefcase' },
    { id: 'uploads', label: 'Subidos', icon: 'bi-cloud-arrow-up' },
    { id: 'text', label: 'Texto', icon: 'bi-alphabet' },
    { id: 'styles', label: 'Estilos', icon: 'bi-palette' },
    { id: 'branding', label: 'Marca', icon: 'bi-shield-check' },
];

/* ─────────────────────────────────────────────────
   Main Component
 ───────────────────────────────────────────────────*/
const AdminAnnouncements = () => {
    const [activeMode, setActiveMode] = useState('anuncios'); // 'anuncios' | 'presentaciones'
    const [announcements, setAnnouncements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState('templates');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 992);
    const [activeAdvTab, setActiveAdvTab] = useState('pos'); // pos, style, brand
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [assets, setAssets] = useState({ oasis: null, iasd: null, rrss: null });
    const [showLibrary, setShowLibrary] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);

    const DEFAULTS = {
        id: '', title: '', title2: '', speaker: '', content: '', tag: 'GALA', date: '', time: '',
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
        titlePos: { x: 0, y: 108 },
        title2Pos: { x: 0, y: 104 },
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
        speakerFont: 'above-the-beyond-script',
        contentFont: 'ModernAge',
        tagFont: 'AdventSans',
        dateFont: 'AdventSans',
        timeFont: 'AdventSans',
        // Colors
        titleColor: '#ffffff',
        title2Color: '#ffffff',
        speakerColor: '#ffffff',
        tagColor: '#ffffff',
        tagBgColor: '#5b2ea6',
        tagBorderColor: '#ffffff',
        showAdvanced: false,
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
                ctx.font = `${fs}px "${formData.titleFont}", serif`;
                ctx.fillStyle = formData.titleColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 15;
                const lines = wrap(formData.title, W * 0.9);
                lines.forEach((l, i) => ctx.fillText(l, pos.x + pos.w / 2, pos.y + i * fs * 1.15));
                ctx.shadowBlur = 0;
            }
        }

        // Title 2
        if (formData.title2) {
            const pos = getRelPos(title2Ref);
            if (pos) {
                const fs = Math.round(getFs(title2Ref));
                ctx.font = `${fs}px "${formData.title2Font}", Arial`;
                ctx.fillStyle = formData.title2Color; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                const lines = wrap(formData.title2, W * 0.9);
                lines.forEach((l, i) => ctx.fillText(l, pos.x + pos.w / 2, pos.y + i * fs * 1.15));
            }
        }

        // Speaker
        if (formData.speaker) {
            const pos = getRelPos(speakerRef);
            if (pos) {
                const fs = Math.round(getFs(speakerRef));
                ctx.font = `${fs}px "${formData.speakerFont}", cursive`;
                ctx.fillStyle = formData.speakerColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                ctx.fillText(formData.speaker, pos.x + pos.w / 2, pos.y);
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
        return canvas;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const canvas = await composeCanvas();
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.93));
            const fileName = `ann-${Date.now()}.jpg`;

            // Convert canvas blob to base64 data URL — stored directly in DB
            // (avoids ephemeral filesystem issue on Railway/Vercel)
            const imageUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

            const announcementData = {
                title: formData.title,
                content: formData.content,
                tag: formData.tag,
                date: formData.date || null,
                time: formData.time || null,
                location: formData.location || null,
                imageUrl: imageUrl
            };

            if (formData.id) {
                await apiClient.put(`/announcements/${formData.id}`, announcementData);
            } else {
                await apiClient.post('/announcements', announcementData);
            }

            fetchAnnouncements(); setShowForm(false); resetForm();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Error al guardar: ' + msg);
        }
        finally { setIsSubmitting(false); }
    };

    const handleEdit = (ann) => {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const imgUrl = ann.imageUrl ? (ann.imageUrl.startsWith('http') ? ann.imageUrl : `${base}${ann.imageUrl}`) : null;
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
        setShowForm(true);
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
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    className="canva-panel bg-white border-end shadow-sm scrollbar-custom"
                    style={{ width: '320px', zIndex: 90, overflowY: 'auto' }}
                >
                    <div className="p-3 d-flex justify-content-between align-items-center border-bottom sticky-top bg-white">
                        <h6 className="fw-bold mb-0 text-uppercase letter-spacing-1">{SIDEBAR_ITEMS.find(i => i.id === activeSidebar)?.label}</h6>
                        <button className="btn-close" style={{ fontSize: '0.7rem' }} onClick={() => setIsSidebarCollapsed(true)}></button>
                    </div>
                    <div className="panel-content p-3">
                        {activeSidebar === 'templates' && (
                            <div className="row g-2">
                                {TEMPLATES.map(tpl => (
                                    <div key={tpl.id} className="col-6">
                                        <div className="tpl-card rounded-3 cursor-pointer overflow-hidden border shadow-sm hover-scale mb-2"
                                            onClick={() => applyTemplate(tpl)}
                                            style={{ height: '100px', background: `linear-gradient(135deg, ${tpl.gradientStart}, ${tpl.gradientEnd})` }}>
                                            <div className="d-flex h-100 align-items-center justify-content-center p-2 text-center text-white x-small fw-bold">
                                                {tpl.name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSidebar === 'elements' && (
                            <div className="elements-grid row g-2">
                                {Object.entries(STOCK_CATEGORIES).map(([cat, imgs]) => (
                                    <div key={cat} className="col-12 mb-3">
                                        <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">{cat}</label>
                                        <div className="row g-1">
                                            {imgs.map((img, i) => (
                                                <div key={i} className="col-4">
                                                    <img src={img} onClick={() => handleSelectStock(img)} className="img-fluid rounded-2 cursor-pointer hover-scale shadow-sm" style={{ height: '60px', width: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSidebar === 'text' && (
                            <div className="text-options">
                                <button className="btn btn-light w-100 mb-2 py-3 rounded-3 border-dashed" onClick={() => set('title', 'Nuevo Título')}>
                                    <h4 className="fw-bold mb-0">Agregar Título</h4>
                                </button>
                                <button className="btn btn-light w-100 mb-2 py-2 rounded-3" onClick={() => set('title2', 'Nuevo Subtítulo')}>
                                    <h6 className="fw-bold mb-0">Agregar Subtítulo</h6>
                                </button>
                                <button className="btn btn-light w-100 mb-4 py-2 rounded-3" onClick={() => set('speaker', 'Expositor')}>
                                    <span className="small">Agregar texto de cuerpo</span>
                                </button>

                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Tipografía</label>
                                {FONTS.map(f => (
                                    <button key={f.value} className="btn btn-outline-dark btn-sm w-100 mb-1 text-start d-flex justify-content-between align-items-center"
                                        onClick={() => set(selectedElementId ? `${selectedElementId}Font` : 'titleFont', f.value)} style={{ fontFamily: f.value }}>
                                        {f.label}
                                        {formData[selectedElementId ? `${selectedElementId}Font` : 'titleFont'] === f.value && <i className="bi bi-check2"></i>}
                                    </button>
                                ))}

                                {selectedElementId && (
                                    <div className="mt-4 p-3 bg-light rounded-3 border">
                                        <label className="x-small fw-bold text-primary text-uppercase mb-2 d-block">Editar {selectedElementId === 'title' ? 'Título' : selectedElementId === 'title2' ? 'Subtítulo' : selectedElementId === 'speaker' ? 'Expositor' : selectedElementId === 'tag' ? 'Etiqueta' : 'Contenido'}</label>
                                        <textarea
                                            className="form-control form-control-sm border-0 bg-white shadow-sm"
                                            rows="3"
                                            style={{ fontSize: '0.8rem' }}
                                            value={formData[selectedElementId]}
                                            onChange={e => set(selectedElementId, e.target.value)}
                                            placeholder="Escribe aquí..."
                                        />
                                        <div className="mt-2 text-end">
                                            <button className="btn btn-sm btn-link text-muted x-small p-0" onClick={() => setSelectedElementId(null)}>Deseleccionar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeSidebar === 'uploads' && (
                            <div className="uploads-section text-center p-4 border-dashed rounded-4 bg-light">
                                <i className="bi bi-cloud-arrow-up fs-2 text-muted mb-2 d-block"></i>
                                <p className="x-small text-muted mb-3">Sube tus propias imágenes</p>
                                <button className="btn btn-primary btn-sm rounded-pill w-100" onClick={() => fileInputRef.current.click()}>Subir Archivo</button>
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                                {formData.bgImage && formData.bgMode === 'image' && (
                                    <div className="mt-3">
                                        <img src={formData.bgImage} className="img-fluid rounded-3 shadow-sm" style={{ height: '80px', objectFit: 'cover' }} />
                                        <button className="btn btn-link btn-sm text-danger d-block w-100 mt-1" onClick={() => setMany({ bgImage: null, bgMode: 'gradient' })}>Eliminar</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeSidebar === 'styles' && (
                            <div className="styles-panel">
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Colores de Fondo</label>
                                <div className="row g-2 mb-4">
                                    <div className="col-6">
                                        <input type="color" className="form-control form-control-color w-100 shadow-sm" value={formData.gradientStart} onChange={e => set('gradientStart', e.target.value)} />
                                    </div>
                                    <div className="col-6">
                                        <input type="color" className="form-control form-control-color w-100 shadow-sm" value={formData.gradientEnd} onChange={e => set('gradientEnd', e.target.value)} />
                                    </div>
                                    <div className="col-12 mt-2">
                                        <button className="btn btn-sm btn-light w-100 rounded-pill" onClick={() => setMany({ gradientStart: '#5b2ea6', gradientEnd: '#16213e' })}>Default Oasis</button>
                                    </div>
                                </div>

                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Mezcla con Imagen</label>
                                <div className="p-3 bg-light rounded-3 shadow-sm border">
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" checked={formData.blendGradient} onChange={e => set('blendGradient', e.target.checked)} />
                                        <label className="x-small fw-bold text-uppercase ms-1">Mezclar Degradado</label>
                                    </div>
                                    <input type="range" className="form-range" min="0" max="1" step="0.05" value={formData.blendOpacity} onChange={e => set('blendOpacity', parseFloat(e.target.value))} />
                                    <div className="d-flex justify-content-between x-small text-muted mt-1"><span>{Math.round(formData.blendOpacity * 100)}%</span></div>
                                </div>

                                {formData.contentStyle === 'biblical' && (
                                    <>
                                        <label className="x-small fw-bold text-muted text-uppercase mb-2 mt-4 d-block">Trama (Patrón)</label>
                                        <div className="row g-2">
                                            {['none', 'dots', 'lines', 'grain'].map(p => (
                                                <div key={p} className="col-3">
                                                    <button
                                                        className={`btn btn-sm w-100 rounded-3 border ${formData.contentPattern === p ? 'btn-primary border-primary' : 'btn-light'}`}
                                                        onClick={() => set('contentPattern', p)}
                                                        style={{ height: '40px', fontSize: '0.6rem' }}
                                                    >
                                                        {p.toUpperCase()}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {activeSidebar === 'branding' && (
                            <div className="branding-panel">
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Logotipos e Iconos</label>
                                <div className="list-group list-group-flush mb-4 shadow-sm rounded-3 border overflow-hidden">
                                    <button className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${formData.showLogoOasis ? 'bg-primary-subtle' : ''}`} onClick={() => set('showLogoOasis', !formData.showLogoOasis)}>
                                        <span className="x-small fw-bold">OASIS LOGO</span>
                                        {formData.showLogoOasis ? <i className="bi bi-eye-fill"></i> : <i className="bi bi-eye-slash text-muted"></i>}
                                    </button>
                                    <button className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${formData.showLogoIasd ? 'bg-primary-subtle' : ''}`} onClick={() => set('showLogoIasd', !formData.showLogoIasd)}>
                                        <span className="x-small fw-bold">IASD LOGO</span>
                                        {formData.showLogoIasd ? <i className="bi bi-eye-fill"></i> : <i className="bi bi-eye-slash text-muted"></i>}
                                    </button>
                                    <button className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${formData.showRrss ? 'bg-primary-subtle' : ''}`} onClick={() => set('showRrss', !formData.showRrss)}>
                                        <span className="x-small fw-bold">RRSS ICONS</span>
                                        {formData.showRrss ? <i className="bi bi-eye-fill"></i> : <i className="bi bi-eye-slash text-muted"></i>}
                                    </button>
                                </div>
                                <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Escala de Logos</label>
                                <div className="p-3 bg-light rounded-3 shadow-sm border">
                                    <div className="mb-2">
                                        <div className="d-flex justify-content-between x-small text-muted mb-1"><span>Icons</span><span>{formData.rrssSize}px</span></div>
                                        <input type="range" className="form-range" min="10" max="100" value={formData.rrssSize} onChange={e => set('rrssSize', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Fecha / Hora / Lugar ─────────────── */}
                    <div className="px-3 pb-3 border-top pt-3">
                        <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Detalles del Evento</label>
                        <div className="mb-2">
                            <label className="x-small text-muted mb-1 d-block">Fecha</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={formData.date || ''}
                                onChange={e => set('date', e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="x-small text-muted mb-1 d-block">Hora</label>
                            <input
                                type="time"
                                className="form-control form-control-sm"
                                value={formData.time || ''}
                                onChange={e => set('time', e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="x-small text-muted mb-1 d-block">Lugar</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Ej: Templo Principal"
                                value={formData.location || ''}
                                onChange={e => set('location', e.target.value)}
                            />
                        </div>
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

    const renderToolbar = () => {
        const target = selectedElementId || 'title';
        const isLogo = target.toLowerCase().includes('logo') || target.toLowerCase().includes('rrss');
        const fontSizeKey = `${target}Size`;
        const fontColorKey = `${target}Color`;
        const fontFamKey = `${target}Font`;

        return (
            <div className="canva-toolbar bg-white shadow rounded-pill p-1 px-3 mb-3 d-flex align-items-center gap-3 border shadow-sm mx-auto animate-fade-in" style={{ width: 'fit-content' }}>
                <div className="d-flex align-items-center gap-2 border-end pe-3">
                    <span className="x-small text-muted fw-bold text-uppercase">{target === 'title' ? 'Título' : target === 'title2' ? 'Sub' : target}:</span>
                    {!isLogo && (
                        <select className="form-select form-select-sm border-0 bg-transparent fw-bold" style={{ width: '120px' }} value={formData[fontFamKey] || 'Arial'} onChange={e => set(fontFamKey, e.target.value)}>
                            {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2 border-end pe-3">
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => set(fontSizeKey, Math.max(isLogo ? 10 : 0.1, (formData[fontSizeKey] || 1) - (isLogo ? 5 : 0.1)))}><i className="bi bi-dash"></i></button>
                    <span className="fw-bold x-small" style={{ width: '40px', textAlign: 'center' }}>{isLogo ? Math.round(formData[fontSizeKey]) : Math.round((formData[fontSizeKey] || 1) * 10) / 10}</span>
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => set(fontSizeKey, Math.min(600, (formData[fontSizeKey] || 1) + (isLogo ? 5 : 0.1)))}><i className="bi bi-plus"></i></button>
                </div>
                <div className="d-flex align-items-center gap-2">
                    {!isLogo && (
                        <input type="color" className="form-control form-control-color border-0 p-0 bg-transparent w-auto" style={{ height: '24px' }} value={formData[fontColorKey] || '#ffffff'} onChange={e => set(fontColorKey, e.target.value)} />
                    )}
                    <button className="btn btn-sm btn-light rounded-pill px-3 x-small fw-bold" onClick={() => set('showAdvanced', !formData.showAdvanced)}>
                        {formData.showAdvanced ? 'Simple' : 'Oasis UI'}
                    </button>
                    {selectedElementId && (
                        <button className="btn btn-sm btn-light rounded-circle text-danger" onClick={() => setSelectedElementId(null)} title="Deseleccionar">
                            <i className="bi bi-x-lg"></i>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="canva-container d-flex" style={{ height: '100vh', width: '100vw', background: '#f4f7f8', overflow: 'hidden' }}>
            <FontPreloader />

            {/* Sidebar Navigation */}
            {renderSidebar()}

            {/* Config Panel (Drawer) */}
            {renderPanel()}

            {/* Main Workspace */}
            <div className="canva-workspace flex-grow-1 d-flex flex-column" style={{ position: 'relative' }}>
                {/* Header / Mode Switcher */}
                <header className="workspace-header d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold" onClick={() => navigate('/admin')}>
                            <i className="bi bi-house-door me-2"></i>Inicio
                        </button>
                        <div className="nav nav-pills p-1 rounded-pill bg-light x-small shadow-sm border">
                            <button className={`nav-link rounded-pill px-3 py-1 fw-bold ${activeMode === 'anuncios' ? 'active' : 'text-dark'}`} onClick={() => setActiveMode('anuncios')}>Anuncios</button>
                            <button className={`nav-link rounded-pill px-3 py-1 fw-bold ${activeMode === 'presentaciones' ? 'active' : 'text-dark'}`} onClick={() => setActiveMode('presentaciones')}>Presentaciones</button>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 border x-small">{formData.format.toUpperCase()} {currentFmt.W}x{currentFmt.H}</span>
                        <button className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold" onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Ocultar Lista' : 'Ver Mis Anuncios'}
                        </button>
                        <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={handleDownload}>
                            <i className="bi bi-download me-2"></i>Descargar
                        </button>
                    </div>
                </header>

                <main
                    className="workspace-body flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4"
                    style={{ overflowY: 'auto', background: '#e9ecef', position: 'relative' }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setSelectedElementId(null);
                    }}
                >
                    {activeMode === 'presentaciones' ? (
                        <div className="w-100 h-100"><OasisPress /></div>
                    ) : (
                        <>

                            {/* Toolbar (Contextual) */}
                            {renderToolbar()}

                            {/* Canvas Area */}
                            <div className="canvas-wrapper d-flex align-items-center justify-content-center w-100" style={{ perspective: '1000px' }}>
                                <motion.div
                                    layout
                                    ref={previewRef}
                                    id="preview-container"
                                    style={{
                                        width: formData.format === 'whatsapp' ? '360px' : (formData.format === 'youtube' ? '100%' : '480px'),
                                        maxWidth: '90%',
                                        aspectRatio: currentFmt.aspect,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        ...previewBgStyle,
                                        cursor: 'default',
                                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4), 0 18px 36px -18px rgba(0,0,0,0.5)',
                                        borderRadius: '4px',
                                        containerType: 'inline-size',
                                        touchAction: 'none'
                                    }}
                                >
                                    {/* Dark Overlay */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)', opacity: formData.bgOpacity, pointerEvents: 'none' }} />

                                    {/* BRANDING (Fixed Corners) */}
                                    {formData.showLogoIasd && assets.iasd && (
                                        <div
                                            onMouseDown={() => setSelectedElementId('logoIasd')}
                                            onTouchStart={() => setSelectedElementId('logoIasd')}
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
                                            style={{
                                                x: formData.tagPos.x, y: formData.tagPos.y, cursor: 'move', alignSelf: 'center', marginBottom: '10px',
                                                outline: selectedElementId === 'tag' ? '2px dashed #00d2f3' : 'none',
                                                outlineOffset: '4px',
                                                borderRadius: '4px'
                                            }}
                                            onDragEnd={(e, info) => set('tagPos', { x: formData.tagPos.x + info.offset.x, y: formData.tagPos.y + info.offset.y })}
                                        >
                                            <div ref={tagRef}>
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
                                                style={{
                                                    x: formData.titlePos.x, y: formData.titlePos.y, cursor: 'move',
                                                    outline: selectedElementId === 'title' ? '2px dashed #00d2f3' : 'none',
                                                    outlineOffset: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                onDragEnd={(e, info) => set('titlePos', { x: formData.titlePos.x + info.offset.x, y: formData.titlePos.y + info.offset.y })}
                                            >
                                                <h2 ref={titleRef} style={{ color: formData.titleColor, fontFamily: formData.titleFont, fontSize: `calc(${formData.titleSize * 3}cqw + 1cqw)`, fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1.1, margin: 0 }}>{formData.title || 'Título'}</h2>
                                            </motion.div>

                                            <motion.div drag dragMomentum={false}
                                                onMouseDown={() => setSelectedElementId('title2')}
                                                onTouchStart={() => setSelectedElementId('title2')}
                                                style={{
                                                    x: formData.title2Pos.x, y: formData.title2Pos.y, cursor: 'move', marginTop: '10px',
                                                    outline: selectedElementId === 'title2' ? '2px dashed #00d2f3' : 'none',
                                                    outlineOffset: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                onDragEnd={(e, info) => set('title2Pos', { x: formData.title2Pos.x + info.offset.x, y: formData.title2Pos.y + info.offset.y })}
                                            >
                                                <h4 ref={title2Ref} style={{ color: formData.title2Color, fontFamily: formData.title2Font, fontSize: `calc(${formData.title2Size * 3}cqw + 1cqw)`, fontWeight: '400', opacity: 0.9, margin: 0 }}>{formData.title2}</h4>
                                            </motion.div>

                                            <motion.div drag dragMomentum={false}
                                                onMouseDown={() => setSelectedElementId('speaker')}
                                                onTouchStart={() => setSelectedElementId('speaker')}
                                                style={{
                                                    x: formData.speakerPos.x, y: formData.speakerPos.y, cursor: 'move', marginTop: '15px',
                                                    outline: selectedElementId === 'speaker' ? '2px dashed #00d2f3' : 'none',
                                                    outlineOffset: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                onDragEnd={(e, info) => set('speakerPos', { x: formData.speakerPos.x + info.offset.x, y: formData.speakerPos.y + info.offset.y })}
                                            >
                                                <div ref={speakerRef} style={{ color: formData.speakerColor, fontFamily: formData.speakerFont, fontSize: `calc(${formData.speakerSize * 3}cqw + 1.5cqw)` }}>{formData.speaker}</div>
                                            </motion.div>
                                        </div>

                                        {/* DESCRIPTION */}
                                        {formData.content && (
                                            <motion.div
                                                drag dragMomentum={false}
                                                onMouseDown={() => setSelectedElementId('content')}
                                                onTouchStart={() => setSelectedElementId('content')}
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
                                                    style={{ x: formData.datePos.x, y: formData.datePos.y, cursor: 'move' }}
                                                    onDragEnd={(e, info) => set('datePos', { x: formData.datePos.x + info.offset.x, y: formData.datePos.y + info.offset.y })}
                                                >
                                                    <div ref={dateRef} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '5px 15px', borderRadius: '30px', color: 'white', fontSize: `calc(${formData.dateSize * 3}cqw)`, whiteSpace: 'nowrap', fontFamily: formData.dateFont }}>
                                                        <i className={`bi ${formData.date ? 'bi-calendar3' : 'bi-clock'} me-2`}></i>
                                                        {[formData.date ? new Date(formData.date + 'T00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : '', formData.time].filter(Boolean).join(' - ')}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="mt-4 d-flex gap-2">
                                {Object.keys(FORMATS).map(k => (
                                    <button key={k} className={`btn btn-sm rounded-pill px-3 fw-bold ${formData.format === k ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => set('format', k)}>
                                        <i className={`bi ${FORMATS[k].icon} me-2`}></i>{FORMATS[k].label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </main>

                {/* Bottom Announcements List (Drawer-like) */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="announcements-list-drawer bg-white border-top shadow-lg"
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40vh', zIndex: 110, overflowY: 'auto' }}
                        >
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white">
                                <h6 className="fw-bold mb-0">MIS ANUNCIOS</h6>
                                <button className="btn-close" onClick={() => setShowForm(false)}></button>
                            </div>
                            <div className="p-0">
                                <table className="table table-hover align-middle mb-0">
                                    <tbody className="x-small">
                                        {announcements.map(ann => {
                                            const imgUrl = ann.image_url ? (ann.image_url.startsWith('http') ? ann.image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${ann.image_url}`) : null;
                                            return (
                                                <tr key={ann.id}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center gap-3 py-2">
                                                            <img src={imgUrl || logoOasis} className="rounded-2 shadow-sm" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                            <div>
                                                                <div className="fw-bold text-dark">{ann.title}</div>
                                                                <div className="text-muted">{ann.tag}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <button className="btn btn-sm btn-light border me-1" onClick={() => handleEdit(ann)}><i className="bi bi-pencil-fill text-primary"></i></button>
                                                        <button className="btn btn-sm btn-light border text-danger" onClick={() => handleDelete(ann.id)}><i className="bi bi-trash-fill"></i></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
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
                        .canva-sidebar {
                            position: fixed !important;
                            bottom: 0;
                            left: 0;
                            width: 100% !important;
                            height: 60px !important;
                            flex-direction: row !important;
                            padding: 0 !important;
                            justify-content: space-around !important;
                            border-right: none !important;
                            border-top: 1px solid rgba(255,255,255,0.1);
                        }
                        .canva-sidebar .nav-btn {
                            height: 100% !important;
                            margin: 0 !important;
                        }
                        .canva-sidebar .canva-logo-mini { display: none !important; }
                        
                        .canva-panel {
                            position: fixed !important;
                            bottom: 60px !important;
                            left: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                            max-height: 50vh !important;
                            border-radius: 20px 20px 0 0 !important;
                            border-right: none !important;
                            box-shadow: 0 -10px 30px rgba(0,0,0,0.1) !important;
                            z-index: 100 !important;
                        }
                        .workspace-header {
                            padding: 0.5rem !important;
                        }
                        .workspace-header .btn-sm {
                            padding: 0.25rem 0.5rem !important;
                            font-size: 0.7rem !important;
                        }
                        .workspace-body {
                            padding-bottom: 70px !important;
                        }
                        #preview-container {
                            width: 100% !important;
                            max-width: 380px !important;
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
                    .canva-toolbar { border-bottom: 2px solid #00d3df !important; }

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
        </div>
    );
};

export default AdminAnnouncements;
