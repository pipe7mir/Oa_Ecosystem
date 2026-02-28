import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';

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
    const handleExportPPTX = () => {
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
        <div className="oasispress-editor" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Menú superior */}
            <div style={{ background: '#f5f5f5', padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input value={title} onChange={e => setTitle(e.target.value)} style={{ fontSize: '1.2rem', fontWeight: 'bold', flex: 1 }} />
                <button onClick={handleExportPDF}>Exportar PDF</button>
                <button onClick={handleExportPPTX}>Exportar PPTX</button>
                <button onClick={() => { setShowImageLibrary(true); setImageCategory('backgrounds'); }}>Biblioteca de Imágenes</button>
            </div>
            {/* Panel principal */}
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Panel de diapositivas */}
                <div style={{ width: 180, background: '#fafafa', borderRight: '1px solid #eee', padding: '1rem' }}>
                    <button onClick={addSlide} style={{ width: '100%', marginBottom: 10 }}>+ Nueva diapositiva</button>
                    {slides.map((slide, idx) => (
                        <div key={slide.id} style={{ marginBottom: 8, border: selectedSlide === idx ? '2px solid #5b2ea6' : '1px solid #ccc', borderRadius: 6, cursor: 'pointer', background: '#fff', padding: 6 }} onClick={() => setSelectedSlide(idx)}>
                            <div style={{ fontWeight: 'bold' }}>Diapositiva {idx + 1}</div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                <button onClick={e => { e.stopPropagation(); duplicateSlide(idx); }}>Duplicar</button>
                                {slides.length > 1 && <button onClick={e => { e.stopPropagation(); deleteSlide(idx); }}>Eliminar</button>}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <label style={{ fontSize: 12 }}>Transición:</label>
                                <select value={slide.transitionType} onChange={e => setTransition(idx, e.target.value)} style={{ width: '100%' }}>
                                    {TRANSITIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Área de edición con transición visual */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={slides[selectedSlide].id + slides[selectedSlide].transitionType}
                            ref={canvasRef}
                            initial={transitionProps[slides[selectedSlide].transitionType].initial}
                            animate={transitionProps[slides[selectedSlide].transitionType].animate}
                            exit={transitionProps[slides[selectedSlide].transitionType].exit}
                            transition={{ duration: 0.7 }}
                            style={{ width: 800, height: 450, background: slides[selectedSlide].background, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {/* Fondo y degradado */}
                            {slides[selectedSlide].gradient && <div style={{ position: 'absolute', inset: 0, background: slides[selectedSlide].gradient, opacity: 0.7, pointerEvents: 'none' }} />}
                            {slides[selectedSlide].overlayColor && <div style={{ position: 'absolute', inset: 0, background: slides[selectedSlide].overlayColor, opacity: 0.3, pointerEvents: 'none' }} />}
                            {/* Elementos */}
                            {slides[selectedSlide].elements.map(el => (
                                el.type === 'image' ? (
                                    <img key={el.id} src={el.content} alt="img" style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} onClick={() => setSelectedElement(el.id)} />
                                ) : (
                                    <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, ...el.style, border: selectedElement === el.id ? '2px solid #5b2ea6' : 'none', cursor: 'pointer', background: el.style.backgroundColor }} onClick={() => setSelectedElement(el.id)}>
                                        <span style={{ fontFamily: el.style.fontFamily, fontSize: el.style.fontSize, color: el.style.color, fontWeight: el.style.bold ? 'bold' : 'normal', fontStyle: el.style.italic ? 'italic' : 'normal', textDecoration: el.style.underline ? 'underline' : 'none' }}>{el.content || 'Texto'}</span>
                                    </div>
                                )
                            ))}
                            {/* Botones para agregar elementos */}
                            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
                                <button onClick={() => addElement('text', { fontFamily: 'Arial', fontSize: 32, color: '#222' })}>Texto</button>
                                <button onClick={() => addElement('image', { url: IMAGE_LIBRARY.backgrounds[0].url })}>Imagen</button>
                                <button onClick={() => addElement('image', { url: IMAGE_LIBRARY.logos[0].url })}>Logo Oasis</button>
                                <button onClick={() => addElement('image', { url: IMAGE_LIBRARY.logos[3].url })}>Logo IASD</button>
                                <button onClick={() => addElement('image', { url: IMAGE_LIBRARY.social[0].url })}>Instagram</button>
                            </div>
                            {/* Panel de propiedades del elemento seleccionado */}
                            {selectedElement && (() => {
                                const el = slides[selectedSlide].elements.find(e => e.id === selectedElement);
                                if (!el) return null;
                                return (
                                    <div style={{ position: 'absolute', top: 16, right: 16, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', padding: 16, minWidth: 220 }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <label>Fuente:</label>
                                            <select value={el.style.fontFamily} onChange={e => updateElement(el.id, { style: { ...el.style, fontFamily: e.target.value } })}>
                                                {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <label>Tamaño:</label>
                                            <input type="number" value={el.style.fontSize} onChange={e => updateElement(el.id, { style: { ...el.style, fontSize: Number(e.target.value) } })} />
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <label>Color:</label>
                                            <input type="color" value={el.style.color} onChange={e => updateElement(el.id, { style: { ...el.style, color: e.target.value } })} />
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <label>Fondo:</label>
                                            <input type="color" value={el.style.backgroundColor} onChange={e => updateElement(el.id, { style: { ...el.style, backgroundColor: e.target.value } })} />
                                        </div>
                                        <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
                                            <button onClick={() => updateElement(el.id, { style: { ...el.style, bold: !el.style.bold } })} style={{ fontWeight: el.style.bold ? 'bold' : 'normal' }}>N</button>
                                            <button onClick={() => updateElement(el.id, { style: { ...el.style, italic: !el.style.italic } })} style={{ fontStyle: el.style.italic ? 'italic' : 'normal' }}>K</button>
                                            <button onClick={() => updateElement(el.id, { style: { ...el.style, underline: !el.style.underline } })} style={{ textDecoration: el.style.underline ? 'underline' : 'none' }}>S</button>
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <label>Eliminar:</label>
                                            <button onClick={() => deleteElement(el.id)} style={{ color: '#c00' }}>Eliminar elemento</button>
                                        </div>
                                    </div>
                                );
                            })()}
                            {/* Selector de degradado y máscara */}
                            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                                <select value={slides[selectedSlide].gradient} onChange={e => setSlides(slides.map((s, i) => i === selectedSlide ? { ...s, gradient: e.target.value } : s))}>
                                    <option value="">Sin degradado</option>
                                    {GRADIENTS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <input type="color" value={slides[selectedSlide].overlayColor} onChange={e => setSlides(slides.map((s, i) => i === selectedSlide ? { ...s, overlayColor: e.target.value } : s))} />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            {/* Biblioteca de imágenes modal */}
            {showImageLibrary && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowImageLibrary(false)}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 400, maxHeight: 600, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h3>Biblioteca de Imágenes</h3>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {Object.keys(IMAGE_LIBRARY).map(cat => (
                                <button key={cat} onClick={() => setImageCategory(cat)}>{cat}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {IMAGE_LIBRARY[imageCategory].map(img => (
                                <div key={img.id} style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }} onClick={() => { addElement('image', { url: img.url }); setShowImageLibrary(false); }}>
                                    <img src={img.url} alt={img.name} style={{ maxWidth: '90%', maxHeight: '90%' }} />
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
