import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../react-ui/styles/theme';
import Draggable from 'react-draggable';

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

/* ─────────────────────────────────────────────────
   Main Component
 ───────────────────────────────────────────────────*/
const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [activeAdvTab, setActiveAdvTab] = useState('pos'); // pos, style, brand
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assets, setAssets] = useState({ oasis: null, iasd: null, rrss: null });

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

            const uploadData = new FormData();
            uploadData.append('file', blob, fileName);

            // Upload image to NestJS Backend
            const uploadRes = await apiClient.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = uploadRes.data.url || uploadRes.data.filename;

            const announcementData = {
                title: formData.title,
                content: formData.content,
                tag: formData.tag,
                date: formData.date,
                image_url: imageUrl
            };

            if (formData.id) {
                await apiClient.put(`/announcements/${formData.id}`, announcementData);
            } else {
                await apiClient.post('/announcements', announcementData);
            }

            fetchAnnouncements(); setShowForm(false); resetForm();
        } catch (err) { alert('Error: ' + err.message); }
        finally { setIsSubmitting(false); }
    };

    const handleEdit = (ann) => {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const imgUrl = ann.image_url ? (ann.image_url.startsWith('http') ? ann.image_url : `${base}${ann.image_url}`) : null;
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
    const fmt = FORMATS[formData.format] || FORMATS.instagram;

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

    return (
        <div className="container-fluid py-4 animate-fade-in" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' }}>
            <FontPreloader />
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-4 shadow-sm bg-white rounded-4 border-start border-primary border-5">
                <div>
                    <h2 className="fw-bold mb-0 text-dark">Creador Unificado Oasis</h2>
                    <p className="text-muted small mb-0">Generador de contenido visual de alto impacto</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => {
                    if (!showForm && !showTemplatePicker) {
                        setShowTemplatePicker(true);
                    } else {
                        setShowForm(false);
                        setShowTemplatePicker(false);
                    }
                }}>
                    {showForm || showTemplatePicker ? 'Cerrar Panel' : '+ Crear Nuevo'}
                </button>
            </div>

            {/* Template Gallery Picker */}
            {showTemplatePicker && (
                <div className="card border-0 shadow-lg rounded-4 animate__animated animate__fadeInUp overflow-hidden mb-4">
                    <div className="card-header bg-dark text-white p-3 d-flex align-items-center gap-2">
                        <i className="bi bi-grid-3x3-gap"></i>
                        <span className="fw-bold text-uppercase x-small letter-spacing-1">Selecciona una Plantilla Base</span>
                    </div>
                    <div className="card-body p-4 bg-light">
                        <div className="row g-3">
                            {TEMPLATES.map(tpl => (
                                <div key={tpl.id} className="col-md-6 col-lg-2-4">
                                    <div className="card h-100 border-0 shadow-sm rounded-4 cursor-pointer transition-all hover-scale"
                                        onClick={() => { resetForm(); applyTemplate(tpl); }}
                                        style={{ overflow: 'hidden', borderBottom: `5px solid ${tpl.tagBgColor || '#ccc'}` }}>
                                        <div className="p-3 text-center" style={{ background: `linear-gradient(135deg, ${tpl.gradientStart}, ${tpl.gradientEnd})`, height: '80px' }}>
                                            <div className="badge rounded-pill" style={{ background: tpl.tagBgColor, color: tpl.tagColor || '#fff', fontSize: '0.6rem' }}>{tpl.tag}</div>
                                        </div>
                                        <div className="card-body p-2 text-center bg-white">
                                            <h6 className="fw-bold mb-1 small">{tpl.name}</h6>
                                            <div className="text-muted italic x-small mb-1" style={{ fontSize: '0.65rem' }}>{tpl.desc}</div>
                                            <div className="x-small text-muted" style={{ fontSize: '0.6rem', borderTop: '1px solid #eee', paddingTop: '4px' }}>{tpl.titleFont} + {tpl.speakerFont === 'above-the-beyond-script' ? 'Script' : 'Sans'}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-4">
                            <button className="btn btn-outline-secondary btn-sm rounded-pill px-4" onClick={() => setShowTemplatePicker(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="row g-4 animate__animated animate__fadeIn">
                    {/* LEFT: Controls */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxHeight: '85vh' }}>
                            <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-sliders2 fs-5"></i>
                                    <span className="fw-bold text-uppercase x-small letter-spacing-1">Canva OASIS</span>
                                </div>
                                <div className="form-check form-switch bg-light bg-opacity-10 px-3 py-1 rounded-pill border border-secondary">
                                    <input className="form-check-input" type="checkbox" checked={formData.showAdvanced} onChange={e => set('showAdvanced', e.target.checked)} id="advToggle" />
                                    <label className="form-check-label x-small fw-bold text-uppercase ms-1 cursor-pointer" htmlFor="advToggle" style={{ fontSize: '0.6rem' }}>Avanzado</label>
                                </div>
                            </div>
                            <div className="card-body p-4 scrollbar-custom" style={{ overflowY: 'auto' }}>
                                {formData.showAdvanced && (
                                    <div className="nav nav-pills nav-justified bg-light p-1 rounded-pill mb-4 shadow-sm border">
                                        <button type="button" className={`nav-link rounded-pill py-1 x-small fw-bold ${activeAdvTab === 'pos' ? 'active' : 'text-dark'}`} onClick={() => setActiveAdvTab('pos')}>📐 Posición</button>
                                        <button type="button" className={`nav-link rounded-pill py-1 x-small fw-bold ${activeAdvTab === 'style' ? 'active' : 'text-dark'}`} onClick={() => setActiveAdvTab('style')}>🎨 Estilo</button>
                                        <button type="button" className={`nav-link rounded-pill py-1 x-small fw-bold ${activeAdvTab === 'brand' ? 'active' : 'text-dark'}`} onClick={() => setActiveAdvTab('brand')}>🛡️ Marca</button>
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="row g-3">

                                    {/* ── SECCIÓN: CONTENIDO ── */}
                                    <div className="col-12 mb-2">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>1</div>
                                            <h6 className="fw-bold mb-0 text-uppercase letter-spacing-1">Información Base</h6>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Título Principal</label>
                                                <input className="form-control" value={formData.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Servicio de Adoración" />
                                            </div>
                                            <div className="col-12 pt-1">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Título Secundario</label>
                                                <input className="form-control" value={formData.title2} onChange={e => set('title2', e.target.value)} placeholder="Ej: Invitado Especial" />
                                            </div>
                                            <div className="col-6 pt-1">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Expositor</label>
                                                <input className="form-control" value={formData.speaker} onChange={e => set('speaker', e.target.value)} placeholder="Pr. Juan Perez" />
                                            </div>
                                            <div className="col-6 pt-1">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Lugar</label>
                                                <input className="form-control" value={formData.location} onChange={e => set('location', e.target.value)} placeholder="Auditorio Principal" />
                                            </div>
                                            <div className="col-6 pt-1">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Fecha</label>
                                                <input type="date" className="form-control" value={formData.date} onChange={e => set('date', e.target.value)} />
                                            </div>
                                            <div className="col-6 pt-1">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Hora</label>
                                                <input type="time" className="form-control" value={formData.time} onChange={e => set('time', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── SECCIÓN: TAGS & BRANDS ── */}
                                    <div className="col-12 mb-2 pt-2 border-top">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>2</div>
                                            <h6 className="fw-bold mb-0 text-uppercase letter-spacing-1">Identidad & Marcadores</h6>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-8">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Texto Etiqueta</label>
                                                <input className="form-control" value={formData.tag} onChange={e => set('tag', e.target.value)} />
                                            </div>
                                            <div className="col-4">
                                                <label className="x-small fw-bold text-muted mb-1 text-uppercase">Estilo Tag</label>
                                                <select className="form-select" value={formData.tagStyle} onChange={e => set('tagStyle', e.target.value)}>
                                                    <option value="pill-translucent">💊 Traslúcido</option>
                                                    <option value="outline">⬜ Borde</option>
                                                    <option value="solid">⬛ Sólido</option>
                                                    <option value="ghost">👻 Texto</option>
                                                </select>
                                            </div>

                                            {/* Tag Advanced Tools */}
                                            {formData.showAdvanced && activeAdvTab === 'pos' && (
                                                <div className="col-12 mt-2 bg-white p-2 rounded-3 border shadow-sm">
                                                    <div className="d-flex justify-content-between x-small text-muted mb-1">
                                                        <span className="fw-bold text-uppercase x-small">Tamaño Etiqueta</span>
                                                        <span>{formData.tagSize}vw</span>
                                                    </div>
                                                    <input type="range" className="form-range" min="0.5" max="8" step="0.1"
                                                        value={formData.tagSize} onChange={e => set('tagSize', parseFloat(e.target.value))} />
                                                    <div className="mt-2 text-center">
                                                        <PosControl label="Posición Etiqueta" pos={formData.tagPos} onChange={val => set('tagPos', val)} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="col-12 mt-2">
                                                <label className="x-small fw-bold text-muted mb-1 d-block text-uppercase">Habilitar Branding</label>
                                                <div className="btn-group w-100 shadow-sm mb-2">
                                                    <button type="button" className={`btn btn-sm ${formData.showLogoIasd ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => set('showLogoIasd', !formData.showLogoIasd)}>IASD</button>
                                                    <button type="button" className={`btn btn-sm ${formData.showLogoOasis ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => set('showLogoOasis', !formData.showLogoOasis)}>OASIS</button>
                                                    <button type="button" className={`btn btn-sm ${formData.showRrss ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => set('showRrss', !formData.showRrss)}>RRSS</button>
                                                </div>
                                            </div>

                                            {/* Branding Logos Size Sliders (Advanced) */}
                                            {formData.showAdvanced && activeAdvTab === 'brand' && (
                                                <div className="col-12 p-3 bg-white rounded-4 shadow-sm mt-2 border">
                                                    <label className="x-small fw-bold text-muted d-block mb-2 text-uppercase">Escala de Logos</label>
                                                    <div className="row g-3">
                                                        {formData.showLogoIasd && (
                                                            <div className="col-6">
                                                                <div className="d-flex justify-content-between x-small text-muted mb-1"><span>IASD</span><span>{formData.logoIasdSize}px</span></div>
                                                                <input type="range" className="form-range" min="10" max="150" value={formData.logoIasdSize} onChange={e => set('logoIasdSize', parseInt(e.target.value))} />
                                                            </div>
                                                        )}
                                                        {formData.showLogoOasis && (
                                                            <div className="col-6">
                                                                <div className="d-flex justify-content-between x-small text-muted mb-1"><span>OASIS</span><span>{formData.logoOasisSize}px</span></div>
                                                                <input type="range" className="form-range" min="10" max="150" value={formData.logoOasisSize} onChange={e => set('logoOasisSize', parseInt(e.target.value))} />
                                                            </div>
                                                        )}
                                                        {formData.showRrss && (
                                                            <div className="col-12 mt-1">
                                                                <div className="d-flex justify-content-between x-small text-muted mb-1"><span>RRSS ICON</span><span>{formData.rrssSize}px</span></div>
                                                                <input type="range" className="form-range" min="10" max="100" value={formData.rrssSize} onChange={e => set('rrssSize', parseInt(e.target.value))} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── SECCIÓN: ESTILO & TIPOGRAFÍA ── */}
                                    <div className="col-12 mb-2 pt-2 border-top">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>3</div>
                                            <h6 className="fw-bold mb-0 text-uppercase letter-spacing-1">Tipografía & Color</h6>
                                        </div>

                                        {/* Color & Typography (Advanced) */}
                                        {formData.showAdvanced && activeAdvTab === 'style' && (
                                            <div className="animate__animated animate__fadeIn">
                                                {/* Color Grid */}
                                                <div className="p-3 bg-white rounded-4 mb-3 border shadow-sm">
                                                    <label className="x-small fw-bold text-muted d-block mb-2 text-uppercase">Paleta de Colores</label>
                                                    <div className="row g-2">
                                                        <div className="col-4 text-center">
                                                            <label className="x-small d-block mb-1">Título 1</label>
                                                            <input type="color" className="form-control form-control-color w-100 border-0 shadow-sm" value={formData.titleColor} onChange={e => set('titleColor', e.target.value)} />
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <label className="x-small d-block mb-1">Título 2</label>
                                                            <input type="color" className="form-control form-control-color w-100 border-0 shadow-sm" value={formData.title2Color} onChange={e => set('title2Color', e.target.value)} />
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <label className="x-small d-block mb-1">Orador</label>
                                                            <input type="color" className="form-control form-control-color w-100 border-0 shadow-sm" value={formData.speakerColor} onChange={e => set('speakerColor', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Typography Controls */}
                                                <div className="p-3 bg-white rounded-4 mb-3 border shadow-sm">
                                                    <label className="x-small fw-bold text-muted d-block mb-3 text-uppercase">Fuentes Tipográficas</label>
                                                    <div className="row g-3">
                                                        <div className="col-6">
                                                            <label className="x-small d-block mb-1">Título Principal</label>
                                                            <select className="form-select form-select-sm" value={formData.titleFont} onChange={e => set('titleFont', e.target.value)}>
                                                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="x-small d-block mb-1">Título Secundario</label>
                                                            <select className="form-select form-select-sm" value={formData.title2Font} onChange={e => set('title2Font', e.target.value)}>
                                                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="x-small d-block mb-1">Expositor</label>
                                                            <select className="form-select form-select-sm" value={formData.speakerFont} onChange={e => set('speakerFont', e.target.value)}>
                                                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="x-small d-block mb-1">Etiqueta/Info</label>
                                                            <select className="form-select form-select-sm" value={formData.tagFont} onChange={e => {
                                                                const val = e.target.value;
                                                                setMany({ tagFont: val, dateFont: val, timeFont: val, locationFont: val });
                                                            }}>
                                                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Geometry & Scaling (Advanced) */}
                                        {formData.showAdvanced && activeAdvTab === 'pos' && (
                                            <div className="animate__animated animate__fadeIn">
                                                {/* Position controls for Titles */}
                                                <div className="px-1 mb-3 bg-white p-2 rounded-3 border shadow-sm">
                                                    <label className="x-small fw-bold text-muted d-block mb-2 text-uppercase">Nivelación de Elementos</label>
                                                    <PosControl label="Título Principal" pos={formData.titlePos} onChange={val => set('titlePos', val)} />
                                                    <PosControl label="Título Secundario" pos={formData.title2Pos} onChange={val => set('title2Pos', val)} />
                                                    <PosControl label="Crédito Orador" pos={formData.speakerPos} onChange={val => set('speakerPos', val)} />
                                                    <PosControl label="Fecha & Hora" pos={formData.datePos} onChange={val => { setMany({ datePos: val, timePos: { ...val, x: -val.x } }); }} />
                                                </div>

                                                {/* Sizes Multi-Slider */}
                                                <div className="p-3 bg-white rounded-4 border shadow-sm">
                                                    <label className="x-small fw-bold text-muted d-block mb-3 text-uppercase">Escala Automática (VW)</label>
                                                    <div className="mb-3">
                                                        <div className="d-flex justify-content-between x-small text-muted mb-1"><span>Títulos</span><span>{formData.titleSize}vw</span></div>
                                                        <input type="range" className="form-range" min="1" max="15" step="0.1" value={formData.titleSize}
                                                            onChange={e => {
                                                                const val = parseFloat(e.target.value);
                                                                setMany({ titleSize: val, title2Size: val * 0.75, speakerSize: val * 0.85 });
                                                            }} />
                                                    </div>
                                                    <div>
                                                        <div className="d-flex justify-content-between x-small text-muted mb-1"><span>Información</span><span>{formData.dateSize}vw</span></div>
                                                        <input type="range" className="form-range" min="1" max="10" step="0.1" value={formData.dateSize}
                                                            onChange={e => {
                                                                const val = parseFloat(e.target.value);
                                                                setMany({ dateSize: val, timeSize: val, locationSize: val });
                                                            }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── SECCIÓN: FONDO & DESCRIPCIÓN ── */}
                                    <div className="col-12 mb-2 pt-2 border-top">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>4</div>
                                            <h6 className="fw-bold mb-0 text-uppercase letter-spacing-1">Fondo & Textos</h6>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="d-flex gap-2 mb-2">
                                                    <button type="button" className={`btn btn-sm flex-grow-1 ${formData.bgMode === 'gradient' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setMany({ bgMode: 'gradient', blendGradient: false })}>Degradado</button>
                                                    <button type="button" className={`btn btn-sm flex-grow-1 ${formData.bgMode === 'image' && !formData.blendGradient ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => { setShowLibrary(true); set('blendGradient', false); }}>Biblioteca</button>
                                                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => fileInputRef.current.click()}>Subir</button>
                                                    <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                                                </div>

                                                {/* Image + Gradient Blend Control */}
                                                {formData.bgImage && (
                                                    <div className="form-check form-switch bg-light p-2 rounded-3 mb-2 px-4 shadow-sm">
                                                        <input className="form-check-input" type="checkbox" checked={formData.blendGradient} onChange={e => set('blendGradient', e.target.checked)} />
                                                        <label className="x-small fw-bold text-uppercase ms-1">Mezclar con Degradado</label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Gradient Colors (Shown if mode is gradient OR blending is active) */}
                                            {(formData.bgMode === 'gradient' || formData.blendGradient) && (
                                                <div className="col-12 p-3 bg-light rounded-4 mb-2">
                                                    <div className="row g-2">
                                                        <div className="col-6"><label className="x-small d-block mb-1">Color 1</label><input type="color" className="form-control form-control-color w-100 shadow-sm" value={formData.gradientStart} onChange={e => set('gradientStart', e.target.value)} /></div>
                                                        <div className="col-6"><label className="x-small d-block mb-1">Color 2</label><input type="color" className="form-control form-control-color w-100 shadow-sm" value={formData.gradientEnd} onChange={e => set('gradientEnd', e.target.value)} /></div>
                                                        {formData.blendGradient && (
                                                            <div className="col-12 mt-2 border-top pt-2">
                                                                <div className="d-flex justify-content-between x-small text-muted mb-1"><span>Intensidad Degradado</span><span>{Math.round(formData.blendOpacity * 100)}%</span></div>
                                                                <input type="range" className="form-range" min="0" max="1" step="0.05" value={formData.blendOpacity} onChange={e => set('blendOpacity', parseFloat(e.target.value))} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="col-12 mt-2">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <label className="x-small fw-bold text-muted text-uppercase">Descripción / Texto Bíblico</label>
                                                    <div className="form-check form-switch px-0 ms-2">
                                                        <input className="form-check-input ms-0" type="checkbox" checked={formData.contentStyle === 'biblical'} onChange={e => set('contentStyle', e.target.checked ? 'biblical' : 'normal')} />
                                                        <label className="x-small fw-bold ms-1">Fondo</label>
                                                    </div>
                                                </div>
                                                <textarea className="form-control shadow-sm border-0" rows="3" value={formData.content} onChange={e => set('content', e.target.value)} placeholder="Agrega versículos o detalles..." />
                                                <div className="mt-2 bg-light p-2 rounded-3">
                                                    <div className="d-flex justify-content-between x-small text-muted mb-1">
                                                        <span className="fw-bold text-uppercase">Tamaño Descripción</span>
                                                        <span>{formData.contentSize}vw</span>
                                                    </div>
                                                    <input type="range" className="form-range mb-2" min="1" max="10" step="0.1" value={formData.contentSize} onChange={e => set('contentSize', parseFloat(e.target.value))} />

                                                    {formData.contentStyle === 'biblical' && formData.showAdvanced && (
                                                        <>
                                                            <div className="d-flex justify-content-between x-small text-muted mb-1 border-top pt-2"><span>Opacidad Fondo (Modo Avanzado)</span><span>{Math.round(formData.contentBgOpacity * 100)}%</span></div>
                                                            <input type="range" className="form-range" min="0" max="1" step="0.05" value={formData.contentBgOpacity} onChange={e => set('contentBgOpacity', parseFloat(e.target.value))} />
                                                        </>
                                                    )}
                                                </div>

                                                <div className="mt-3">
                                                    {formData.showAdvanced ? (
                                                        <>
                                                            <PosControl label="Descripción" pos={formData.contentPos} onChange={val => set('contentPos', val)} />
                                                            <div className="row g-2">
                                                                <div className="col-6"><PosControl label="Fecha y Hora" pos={formData.datePos} onChange={val => set('datePos', val)} /></div>
                                                                <div className="col-6"><PosControl label="Lugar" pos={formData.locationPos} onChange={val => set('locationPos', val)} /></div>
                                                                <div className="col-6"><PosControl label="RRSS" pos={formData.rrssPos} onChange={val => set('rrssPos', val)} /></div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-2">
                                                            <span className="x-small text-muted italic">Usa el modo avanzado para mover elementos con precisión</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 pt-3 border-top mt-4">
                                        <button type="submit" disabled={isSubmitting} className="btn btn-dark w-100 py-3 fw-bold rounded-pill shadow mb-2">
                                            {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>PUBLICANDO...</> : '✓ FINALIZAR Y PUBLICAR'}
                                        </button>
                                        <button type="button" onClick={handleDownload} className="btn btn-outline-dark w-100 rounded-pill"><i className="bi bi-download me-2"></i>Capturar Diseño</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Live Preview */}
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
                            <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                <span className="fw-bold x-small text-uppercase letter-spacing-1">Vista Previa Estilo Oasis</span>
                                <div className="btn-group btn-group-sm">
                                    <button className="btn btn-sm btn-outline-light" onClick={handleFullscreen} title="Modo Proyectar">
                                        <i className="bi bi-display"></i>
                                    </button>
                                    {Object.keys(FORMATS).map(k => (
                                        <button key={k} className={`btn btn-sm ${formData.format === k ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => set('format', k)}>
                                            <i className={`bi ${FORMATS[k].icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="card-body p-5 d-flex flex-column align-items-center justify-content-center" style={{ background: '#e9ebed' }}>
                                <div ref={previewRef} id="preview-container" onMouseDown={onDragStart} onTouchStart={onDragStart}
                                    style={{
                                        width: formData.format === 'whatsapp' ? '448px' : (formData.format === 'youtube' ? '100%' : '608px'),
                                        aspectRatio: fmt.aspect, position: 'relative', overflow: 'hidden', ...previewBgStyle, cursor: 'grab',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '12px',
                                        containerType: 'inline-size'
                                    }}>

                                    {/* Dark Overlay (Legacy) */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)', opacity: formData.bgOpacity, pointerEvents: 'none' }} />

                                    {/* BRANDING (Fixed Corners) */}
                                    {formData.showLogoIasd && assets.iasd && (
                                        <div style={{ position: 'absolute', top: '5%', left: '5%', pointerEvents: 'none' }}>
                                            <img src={assets.iasd} style={{ height: `${formData.logoIasdSize}px`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        </div>
                                    )}
                                    {formData.showLogoOasis && assets.oasis && (
                                        <div style={{ position: 'absolute', top: '4%', right: '5%', pointerEvents: 'none' }}>
                                            <img src={assets.oasis} style={{ height: `${formData.logoOasisSize}px`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        </div>
                                    )}

                                    {/* CONTENT */}
                                    <div className="p-3 p-md-4 d-flex flex-column justify-content-center" style={{ position: 'absolute', inset: 0, zIndex: 5 }}>

                                        {/* TAG */}
                                        <Draggable nodeRef={tagRef} bounds="parent" position={formData.tagPos} onStop={(e, d) => set('tagPos', { x: d.x, y: d.y })}>
                                            <div ref={tagRef} style={{ display: 'inline-block', cursor: 'move', alignSelf: 'center', marginBottom: '10px' }}>
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
                                        </Draggable>

                                        {/* TITLES & SPEAKER */}
                                        <div className="mt-2">
                                            <Draggable nodeRef={titleRef} bounds="parent" position={formData.titlePos} onStop={(e, d) => set('titlePos', { x: d.x, y: d.y })}>
                                                <div ref={titleRef} style={{ cursor: 'move', textAlign: 'center' }}>
                                                    <h2 style={{ color: formData.titleColor, fontFamily: formData.titleFont, fontSize: `calc(${formData.titleSize * 3}cqw + 1cqw)`, fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>{formData.title || 'Título'}</h2>
                                                </div>
                                            </Draggable>

                                            <Draggable nodeRef={title2Ref} bounds="parent" position={formData.title2Pos} onStop={(e, d) => set('title2Pos', { x: d.x, y: d.y })}>
                                                <div ref={title2Ref} style={{ cursor: 'move', textAlign: 'center' }}>
                                                    <h4 style={{ color: formData.title2Color, fontFamily: formData.title2Font, fontSize: `calc(${formData.title2Size * 3}cqw + 1cqw)`, fontWeight: '400', opacity: 0.9 }}>{formData.title2}</h4>
                                                </div>
                                            </Draggable>

                                            <Draggable nodeRef={speakerRef} bounds="parent" position={formData.speakerPos} onStop={(e, d) => set('speakerPos', { x: d.x, y: d.y })}>
                                                <div ref={speakerRef} style={{ cursor: 'move', textAlign: 'center' }}>
                                                    <div style={{ color: formData.speakerColor, fontFamily: formData.speakerFont, fontSize: `calc(${formData.speakerSize * 3}cqw + 1.5cqw)` }}>{formData.speaker}</div>
                                                </div>
                                            </Draggable>
                                        </div>

                                        {/* DESCRIPTION */}
                                        {formData.content && (
                                            <Draggable nodeRef={contentRef} bounds="parent" position={formData.contentPos} onStop={(e, d) => set('contentPos', { x: d.x, y: d.y })}>
                                                <div ref={contentRef} style={{
                                                    cursor: 'move', textAlign: 'center', margin: '15px auto', padding: '12px 20px',
                                                    background: formData.contentStyle === 'biblical' ? `rgba(255,255,255,${formData.contentBgOpacity})` : 'transparent',
                                                    backdropFilter: formData.contentStyle === 'biblical' ? 'blur(4px)' : 'none',
                                                    borderRadius: '16px', maxWidth: '90%'
                                                }}>
                                                    <p style={{ color: 'white', fontSize: `calc(${formData.contentSize * 3}cqw + 1cqw)`, margin: 0, lineHeight: 1.4, fontFamily: formData.contentFont }}>{formData.content}</p>
                                                </div>
                                            </Draggable>
                                        )}

                                        {/* INFO PILLS */}
                                        <div className="mt-auto pb-4 d-flex flex-wrap justify-content-center gap-2">
                                            {(formData.date || formData.time) && (
                                                <Draggable nodeRef={dateRef} bounds="parent" position={formData.datePos} onStop={(e, d) => set('datePos', { x: d.x, y: d.y })}>
                                                    <div ref={dateRef} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '5px 15px', borderRadius: '30px', color: 'white', fontSize: `calc(${formData.dateSize * 3}cqw)`, cursor: 'move', fontFamily: formData.dateFont }}>
                                                        <i className={`bi ${formData.date ? 'bi-calendar3' : 'bi-clock'} me-2`}></i>
                                                        {[formData.date ? new Date(formData.date + 'T00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : '', formData.time].filter(Boolean).join(' - ')}
                                                    </div>
                                                </Draggable>
                                            )}
                                            {formData.location && <Draggable nodeRef={locationRef} bounds="parent" position={formData.locationPos} onStop={(e, d) => set('locationPos', { x: d.x, y: d.y })}><div ref={locationRef} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '5px 15px', borderRadius: '30px', color: 'white', fontSize: `calc(${formData.locationSize * 3}cqw)`, cursor: 'move', fontFamily: formData.tagFont || 'Arial' }}><i className="bi bi-geo-alt me-2"></i>{formData.location}</div></Draggable>}
                                        </div>

                                        {/* RRSS */}
                                        {formData.showRrss && (
                                            <Draggable nodeRef={rrssRef} bounds="parent" position={formData.rrssPos} onStop={(e, d) => set('rrssPos', { x: d.x, y: d.y })}>
                                                <div ref={rrssRef} style={{ cursor: 'move', width: '100%', textAlign: 'center' }}>
                                                    <img src={assets.rrss} style={{ height: `${formData.rrssSize}px`, opacity: 0.9 }} />
                                                </div>
                                            </Draggable>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-3 x-small text-muted">{fmt.W} x {fmt.H} pixels | {fmt.desc}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List Table */}
            {!showForm && (
                <div className="card border-0 shadow-sm mt-4 rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light"><tr><th className="ps-4">Anuncio</th><th className="text-end pe-4">Acciones</th></tr></thead>
                            <tbody>
                                {announcements.map(ann => {
                                    const imgUrl = ann.image_url ? (ann.image_url.startsWith('http') ? ann.image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${ann.image_url}`) : null;
                                    return (
                                        <tr key={ann.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    {imgUrl ? (
                                                        <img src={imgUrl} alt={ann.title} className="rounded-3 shadow-sm" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="bg-light rounded-3 d-flex align-items-center justify-content-center text-muted shadow-sm" style={{ width: '80px', height: '80px' }}>
                                                            <i className="bi bi-image fs-4"></i>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="fw-bold fs-6 mb-1 text-dark">{ann.title}</div>
                                                        <div className="x-small text-muted mb-2 text-truncate" style={{ maxWidth: '400px' }}>{ann.content || 'Sin descripción'}</div>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2 py-1 x-small fw-normal">
                                                                <i className="bi bi-tag-fill me-1"></i>{ann.tag}
                                                            </span>
                                                            {ann.date && (
                                                                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1 x-small fw-normal">
                                                                    <i className="bi bi-calendar3 me-1"></i>{new Date(ann.date + 'T00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group btn-group-sm shadow-sm rounded-pill">
                                                    <button className="btn btn-light border" onClick={() => handleEdit(ann)} title="Editar"><i className="bi bi-pencil-fill text-primary"></i></button>
                                                    <button className="btn btn-light border text-danger" onClick={() => handleDelete(ann.id)} title="Eliminar"><i className="bi bi-trash-fill"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
            `}</style>
        </div>
    );
};

export default AdminAnnouncements;
