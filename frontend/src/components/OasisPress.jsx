import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import OasisInfiniteEngine from './OasisInfiniteEngine';
import SlideWrapper from './SlideWrapper';

// Biblioteca de imágenes y logos
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
        { id: 'social-x', name: 'X / Twitter', url: '/src/img/logos/RRSSX.png' },
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
];
const COLORS = ['#5b2ea6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#000000', '#ffffff', '#6b7280'];
const GRADIENTS = [
    'linear-gradient(135deg, #5b2ea6 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #232526 0%, #414345 100%)',
    'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
];
const TRANSITIONS = [
    { value: 'fade', label: 'Desvanecer (Estándar)' },
    { value: 'morph', label: 'Transformar (PowerPoint Morph)' },
    { value: 'infinite', label: 'Movimiento Infinito (Prezi)' },
    { value: 'slide', label: 'Deslizar' },
    { value: 'zoom', label: 'Zoom' },
];

const createDefaultSlide = () => ({
    id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order: 0,
    background: '#ffffff',
    backgroundImage: '',
    gradient: '',
    overlayColor: '',
    elements: [],
    transitionType: 'fade',
});

const OasisPress = () => {
    const [slides, setSlides] = useState([createDefaultSlide()]);
    const [selectedSlide, setSelectedSlide] = useState(0);
    const [title, setTitle] = useState('Presentación sin título');
    const [showImageLibrary, setShowImageLibrary] = useState(false);
    const [imageCategory, setImageCategory] = useState('backgrounds');
    const [selectedElement, setSelectedElement] = useState(null);
    const canvasRef = useRef(null);
    const [mode, setMode] = useState('classic'); // 'classic' o 'infinite'

    // Funciones de slides
    const addSlide = () => {
        setSlides([...slides, createDefaultSlide()]);
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
    const setTransition = (idx, type) => {
        const newSlides = slides.map((slide, i) => i === idx ? { ...slide, transitionType: type } : slide);
        setSlides(newSlides);
    };
    // Elementos en slide
    const addElement = (type, props = {}) => {
        const newElement = {
            id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: 100, y: 100, width: 200, height: 60,
            style: { fontFamily: 'Arial', fontSize: 24, color: '#222', backgroundColor: 'transparent', ...props },
            content: type === 'image' ? props.url : '',
        };
        const newSlides = slides.map((slide, i) => i === selectedSlide ? { ...slide, elements: [...slide.elements, newElement] } : slide);
        setSlides(newSlides);
        setSelectedElement(newElement.id);
    };
    const updateElement = (elId, changes) => {
        const newSlides = slides.map((slide, i) => {
            if (i !== selectedSlide) return slide;
            return {
                ...slide,
                elements: slide.elements.map(el => el.id === elId ? { ...el, ...changes } : el),
            };
        });
        setSlides(newSlides);
    };
    const deleteElement = (elId) => {
        const newSlides = slides.map((slide, i) => {
            if (i !== selectedSlide) return slide;
            return {
                ...slide,
                elements: slide.elements.filter(el => el.id !== elId),
            };
        });
        setSlides(newSlides);
        setSelectedElement(null);
    };
    // Exportar PDF/PPTX
    const handleExportPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        for (let i = 0; i < slides.length; i++) {
            if (canvasRef.current) {
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
    // Transiciones visuales
    const transitionProps = {
        fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
        morph: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 } },
        infinite: { initial: { x: -800 }, animate: { x: 0 }, exit: { x: 800 } },
        slide: { initial: { x: 800 }, animate: { x: 0 }, exit: { x: -800 } },
        zoom: { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.5, opacity: 0 } },
    };

    // Render
    return (
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-100 via-white to-gray-200 font-[Inter,sans-serif]">
            {/* Menú superior Glassmorphism */}
            <div className="flex items-center gap-4 px-8 py-4 border-b border-white/20 backdrop-blur-xl bg-white/5 shadow-lg">
                <input value={title} onChange={e => setTitle(e.target.value)} className="text-2xl font-bold flex-1 bg-transparent border-none outline-none text-gray-900 drop-shadow-lg" />
                <button className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={handleExportPDF}>Exportar PDF</button>
                <button className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={handleExportPPTX}>Exportar PPTX</button>
                <button className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={() => { setShowImageLibrary(true); setImageCategory('backgrounds'); }}>Biblioteca de Imágenes</button>
            </div>
            {/* Selector de modo */}
            <div className="flex gap-4 px-8 py-2">
                <button className={`px-4 py-2 rounded-xl font-bold ${mode === 'classic' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-900'}`} onClick={() => setMode('classic')}>Editor Clásico</button>
                <button className={`px-4 py-2 rounded-xl font-bold ${mode === 'infinite' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-900'}`} onClick={() => setMode('infinite')}>Lienzo Infinito</button>
            </div>
            {/* Renderiza el modo seleccionado */}
            {mode === 'classic' ? (
                <div className="flex flex-1">
                    {/* Panel de diapositivas Glassmorphism */}
                    <div className="w-64 bg-white/10 border-r border-white/20 p-6 flex flex-col gap-4 backdrop-blur-xl shadow-lg">
                        <button className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={addSlide}>+ Nueva diapositiva</button>
                        {slides.map((slide, idx) => (
                            <div key={slide.id} className={`mb-2 rounded-xl p-4 bg-white/10 border ${selectedSlide === idx ? 'border-purple-600 ring-2 ring-purple-400' : 'border-white/20'} shadow-lg cursor-pointer`} onClick={() => setSelectedSlide(idx)}>
                                <div className="font-bold text-lg text-gray-900">Diapositiva {idx + 1}</div>
                                <div className="flex gap-2 mt-2">
                                    <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-sm font-semibold text-gray-900" onClick={e => { e.stopPropagation(); duplicateSlide(idx); }}>Duplicar</button>
                                    {slides.length > 1 && <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-red-200 transition-all duration-200 shadow border border-white/20 text-sm font-semibold text-red-700" onClick={e => { e.stopPropagation(); deleteSlide(idx); }}>Eliminar</button>}
                                </div>
                                <div className="mt-2">
                                    <label className="text-xs text-gray-700">Transición:</label>
                                    <select value={slide.transitionType} onChange={e => setTransition(idx, e.target.value)} className="w-full rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-gray-900">
                                        {TRANSITIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Área de edición con transición visual y Glassmorphism */}
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white/60 via-gray-100 to-gray-200">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slides[selectedSlide].id + slides[selectedSlide].transitionType}
                                ref={canvasRef}
                                initial={transitionProps[slides[selectedSlide].transitionType].initial}
                                animate={transitionProps[slides[selectedSlide].transitionType].animate}
                                exit={transitionProps[slides[selectedSlide].transitionType].exit}
                                transition={{ duration: 0.7 }}
                                className="relative w-[800px] h-[450px] rounded-3xl shadow-2xl border border-white/20 bg-white/10 backdrop-blur-2xl flex items-center justify-center overflow-hidden"
                            >
                                {/* Fondo y degradado */}
                                {slides[selectedSlide].gradient && <div className="absolute inset-0" style={{ background: slides[selectedSlide].gradient, opacity: 0.7, pointerEvents: 'none' }} />}
                                {slides[selectedSlide].overlayColor && <div className="absolute inset-0" style={{ background: slides[selectedSlide].overlayColor, opacity: 0.3, pointerEvents: 'none' }} />}
                                {/* Elementos */}
                                {slides[selectedSlide].elements.map(el => (
                                    el.type === 'image' ? (
                                        <img key={el.id} src={el.content} alt="img" className="absolute rounded-xl shadow-lg" style={{ left: el.x, top: el.y, width: el.width, height: el.height }} onClick={() => setSelectedElement(el.id)} />
                                    ) : (
                                        <div key={el.id} className={`absolute flex items-center justify-center ${selectedElement === el.id ? 'ring-2 ring-purple-400' : ''}`} style={{ left: el.x, top: el.y, width: el.width, height: el.height, background: el.style.backgroundColor, cursor: 'pointer' }} onClick={() => setSelectedElement(el.id)}>
                                            <span style={{ fontFamily: el.style.fontFamily, fontSize: el.style.fontSize, color: el.style.color, fontWeight: el.style.bold ? 'bold' : 'normal', fontStyle: el.style.italic ? 'italic' : 'normal', textDecoration: el.style.underline ? 'underline' : 'none', textShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>{el.content || 'Texto'}</span>
                                        </div>
                                    )
                                ))}
                                {/* Botones para agregar elementos */}
                                <div className="absolute bottom-6 left-6 flex gap-4">
                                    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={() => addElement('text', { fontFamily: 'Inter', fontSize: 32, color: '#222' })}>Texto</button>
                                    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={() => addElement('image', { url: IMAGE_LIBRARY.backgrounds[0].url })}>Imagen</button>
                                    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={() => addElement('image', { url: IMAGE_LIBRARY.logos[0].url })}>Logo Oasis</button>
                                    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={() => addElement('image', { url: IMAGE_LIBRARY.logos[3].url })}>Logo IASD</button>
                                    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={() => addElement('image', { url: IMAGE_LIBRARY.social[0].url })}>Instagram</button>
                                </div>
                                {/* Panel de propiedades del elemento seleccionado */}
                                {selectedElement && (() => {
                                    const el = slides[selectedSlide].elements.find(e => e.id === selectedElement);
                                    if (!el) return null;
                                    return (
                                        <div className="absolute top-6 right-6 bg-white/80 rounded-xl shadow-2xl border border-white/20 p-6 min-w-[220px] backdrop-blur-xl" style={{ boxShadow: '0 8px 32px rgba(255,255,255,0.12)' }}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fuente:</label>
                                                <select value={el.style.fontFamily} onChange={e => updateElement(el.id, { style: { ...el.style, fontFamily: e.target.value } })} className="w-full rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-gray-900">
                                                    {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tamaño:</label>
                                                <input type="number" value={el.style.fontSize} onChange={e => updateElement(el.id, { style: { ...el.style, fontSize: Number(e.target.value) } })} className="w-full rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-gray-900" />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Color:</label>
                                                <input type="color" value={el.style.color} onChange={e => updateElement(el.id, { style: { ...el.style, color: e.target.value } })} className="w-full h-8 rounded-lg border border-white/20" />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fondo:</label>
                                                <input type="color" value={el.style.backgroundColor} onChange={e => updateElement(el.id, { style: { ...el.style, backgroundColor: e.target.value } })} className="w-full h-8 rounded-lg border border-white/20" />
                                            </div>
                                            <div className="mb-4 flex gap-2">
                                                <button className={`px-2 py-1 rounded-lg ${el.style.bold ? 'bg-purple-400 text-white' : 'bg-white/10 text-gray-900'} border border-white/20`} onClick={() => updateElement(el.id, { style: { ...el.style, bold: !el.style.bold } })}>N</button>
                                                <button className={`px-2 py-1 rounded-lg ${el.style.italic ? 'bg-purple-400 text-white' : 'bg-white/10 text-gray-900'} border border-white/20`} onClick={() => updateElement(el.id, { style: { ...el.style, italic: !el.style.italic } })}>K</button>
                                                <button className={`px-2 py-1 rounded-lg ${el.style.underline ? 'bg-purple-400 text-white' : 'bg-white/10 text-gray-900'} border border-white/20`} onClick={() => updateElement(el.id, { style: { ...el.style, underline: !el.style.underline } })}>S</button>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Eliminar:</label>
                                                <button className="w-full px-3 py-2 rounded-lg bg-red-500 hover:bg-red-700 text-white font-bold" onClick={() => deleteElement(el.id)}>Eliminar elemento</button>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {/* Selector de degradado y máscara */}
                                <div className="absolute top-6 left-6 flex gap-4">
                                    <select value={slides[selectedSlide].gradient} onChange={e => setSlides(slides.map((s, i) => i === selectedSlide ? { ...s, gradient: e.target.value } : s))} className="rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-gray-900">
                                        <option value="">Sin degradado</option>
                                        {GRADIENTS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <input type="color" value={slides[selectedSlide].overlayColor} onChange={e => setSlides(slides.map((s, i) => i === selectedSlide ? { ...s, overlayColor: e.target.value } : s))} className="h-8 rounded-lg border border-white/20" />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <OasisInfiniteEngine initialSlides={slides} />
            )}
            {/* Biblioteca de imágenes modal Glassmorphism */}
            {showImageLibrary && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowImageLibrary(false)}>
                    <div className="bg-white/80 rounded-2xl shadow-2xl p-8 min-w-[400px] max-h-[600px] overflow-y-auto border border-white/20 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Biblioteca de Imágenes</h3>
                        <div className="flex gap-4 mb-6">
                            {Object.keys(IMAGE_LIBRARY).map(cat => (
                                <button key={cat} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/30 transition-all duration-200 shadow border border-white/20 text-lg font-semibold text-gray-900" onClick={() => setImageCategory(cat)}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-6">
                            {IMAGE_LIBRARY[imageCategory].map(img => (
                                <div key={img.id} className="w-[100px] h-[100px] rounded-xl overflow-hidden border border-white/20 cursor-pointer flex items-center justify-center bg-white/10 hover:bg-white/30 transition-all duration-200 shadow" onClick={() => { addElement('image', { url: img.url }); setShowImageLibrary(false); }}>
                                    <img src={img.url} alt={img.name} className="max-w-[90%] max-h-[90%]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OasisPress;
