import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../react-ui/styles/theme';
import apiClient from '../api/client';

// ===============================
// OASIS PRESS - Presentation Editor
// ===============================
// PowerPoint-like features with Liquid Glass aesthetics

// Available fonts
const FONTS = [
    { name: 'AdventSans', label: 'Advent Sans' },
    { name: 'ModernAge', label: 'Modern Age' },
    { name: 'Arial', label: 'Arial' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Times New Roman', label: 'Times New Roman' },
    { name: 'Verdana', label: 'Verdana' },
    { name: 'Courier New', label: 'Courier New' },
    { name: 'Impact', label: 'Impact' },
];

// Preset colors
const COLORS = ['#5b2ea6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#000000', '#ffffff', '#6b7280'];

// Default slide
const createDefaultSlide = () => ({
    id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order: 0,
    background: '#ffffff',
    backgroundImage: '',
    elements: [],
    transition: 'morph'
});

// Default presentation
const createDefaultPresentation = () => ({
    title: 'Nueva Presentación',
    description: '',
    slides: [createDefaultSlide()],
    settings: { aspectRatio: '16:9', defaultTransition: 'morph' }
});

// Helper to safely get slides
const getSlides = (presentation) => {
    if (!presentation) return [];
    if (Array.isArray(presentation.slides)) return presentation.slides;
    return [];
};

// Helper to safely get slide
const getSlide = (presentation, index) => {
    const slides = getSlides(presentation);
    return slides[index] || null;
};

// Helper to safely get elements
const getElements = (slide) => {
    if (!slide) return [];
    if (Array.isArray(slide.elements)) return slide.elements;
    return [];
};

const OasisPress = () => {
    // State
    const [presentations, setPresentations] = useState([]);
    const [currentPresentation, setCurrentPresentation] = useState(null);
    const [selectedSlide, setSelectedSlide] = useState(0);
    const [selectedElement, setSelectedElement] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPresentMode, setIsPresentMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingTextId, setEditingTextId] = useState(null);
    
    // Refs
    const canvasRef = useRef(null);
    const touchStartRef = useRef({ x: 0, y: 0 });

    // Liquid Glass styles
    const glassCard = {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(91, 46, 166, 0.1)',
    };

    const glassPrimary = {
        background: `linear-gradient(135deg, ${theme.colors.primary}dd, ${theme.colors.primary}99)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
    };

    // ===============================
    // API Functions
    // ===============================
    const fetchPresentations = async () => {
        try {
            const data = await apiClient.get('/presentations');
            const normalized = (Array.isArray(data) ? data : []).map(p => ({
                ...p,
                slides: Array.isArray(p.slides) ? p.slides : [createDefaultSlide()]
            }));
            setPresentations(normalized);
        } catch (error) {
            console.error('Error fetching presentations:', error);
            setPresentations([]);
        } finally {
            setLoading(false);
        }
    };

    const createPresentation = async () => {
        const newPres = createDefaultPresentation();
        try {
            const created = await apiClient.post('/presentations', newPres);
            const normalized = {
                ...created,
                slides: Array.isArray(created.slides) ? created.slides : [createDefaultSlide()]
            };
            setPresentations(prev => [normalized, ...(prev || [])]);
            setCurrentPresentation(normalized);
            setSelectedSlide(0);
            setIsEditing(true);
        } catch (error) {
            console.error('Error creating presentation:', error);
            // Create locally if API fails
            const localPres = { ...newPres, id: `local-${Date.now()}` };
            setPresentations(prev => [localPres, ...(prev || [])]);
            setCurrentPresentation(localPres);
            setSelectedSlide(0);
            setIsEditing(true);
        }
    };

    const savePresentation = async () => {
        if (!currentPresentation) return;
        setSaving(true);
        try {
            const updated = await apiClient.put(`/presentations/${currentPresentation.id}`, currentPresentation);
            const normalized = {
                ...updated,
                slides: Array.isArray(updated.slides) ? updated.slides : getSlides(currentPresentation)
            };
            setPresentations(prev => (prev || []).map(p => p.id === normalized.id ? normalized : p));
            setCurrentPresentation(normalized);
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const deletePresentation = async (id) => {
        if (!window.confirm('¿Eliminar esta presentación?')) return;
        try {
            await apiClient.del(`/presentations/${id}`);
            setPresentations(prev => (prev || []).filter(p => p.id !== id));
            if (currentPresentation?.id === id) {
                setCurrentPresentation(null);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    useEffect(() => {
        fetchPresentations();
    }, []);

    // ===============================
    // Slide Management
    // ===============================
    const addSlide = () => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const newSlide = {
            ...createDefaultSlide(),
            order: slides.length
        };
        const updated = {
            ...currentPresentation,
            slides: [...slides, newSlide]
        };
        setCurrentPresentation(updated);
        setSelectedSlide(slides.length);
    };

    const deleteSlide = (index) => {
        const slides = getSlides(currentPresentation);
        if (slides.length <= 1) return;
        const updated = {
            ...currentPresentation,
            slides: slides.filter((_, i) => i !== index)
        };
        setCurrentPresentation(updated);
        setSelectedSlide(Math.max(0, index - 1));
    };

    const duplicateSlide = (index) => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const slideToCopy = slides[index];
        if (!slideToCopy) return;
        const newSlide = {
            ...JSON.parse(JSON.stringify(slideToCopy)),
            id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        const newSlides = [...slides];
        newSlides.splice(index + 1, 0, newSlide);
        setCurrentPresentation({ ...currentPresentation, slides: newSlides });
        setSelectedSlide(index + 1);
    };

    const updateSlideBackground = (color) => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const updatedSlides = [...slides];
        if (updatedSlides[selectedSlide]) {
            updatedSlides[selectedSlide] = { ...updatedSlides[selectedSlide], background: color };
            setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
        }
    };

    // ===============================
    // Element Management
    // ===============================
    const addElement = (type) => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const currentSlide = slides[selectedSlide];
        if (!currentSlide) return;

        const newElement = {
            id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: 50 + Math.random() * 100,
            y: 50 + Math.random() * 100,
            width: type === 'text' ? 400 : type === 'heading' ? 600 : 200,
            height: type === 'text' ? 80 : type === 'heading' ? 100 : 200,
            content: type === 'text' ? 'Haga clic para editar texto' : type === 'heading' ? 'Título' : '',
            rotation: 0,
            opacity: 1,
            style: {
                fontSize: type === 'heading' ? 48 : 24,
                fontFamily: 'AdventSans, sans-serif',
                fontWeight: type === 'heading' ? 'bold' : 'normal',
                fontStyle: 'normal',
                textDecoration: 'none',
                color: theme.colors.text.primary,
                backgroundColor: type === 'shape' ? theme.colors.primary : 'transparent',
                borderRadius: type === 'shape' ? 8 : 0,
                textAlign: 'center',
                lineHeight: 1.4,
                padding: 12,
                border: 'none',
                boxShadow: 'none'
            }
        };
        
        const updatedSlides = [...slides];
        updatedSlides[selectedSlide] = {
            ...currentSlide,
            elements: [...getElements(currentSlide), newElement]
        };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
        setSelectedElement(newElement.id);
    };

    const updateElement = (elementId, updates) => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const currentSlide = slides[selectedSlide];
        if (!currentSlide) return;

        const elements = getElements(currentSlide);
        const updatedElements = elements.map(el =>
            el.id === elementId ? { ...el, ...updates } : el
        );
        const updatedSlides = [...slides];
        updatedSlides[selectedSlide] = { ...currentSlide, elements: updatedElements };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
    };

    const updateElementStyle = (elementId, styleUpdates) => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const currentSlide = slides[selectedSlide];
        if (!currentSlide) return;

        const elements = getElements(currentSlide);
        const updatedElements = elements.map(el =>
            el.id === elementId ? { ...el, style: { ...el.style, ...styleUpdates } } : el
        );
        const updatedSlides = [...slides];
        updatedSlides[selectedSlide] = { ...currentSlide, elements: updatedElements };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
    };

    const deleteElement = (elementId) => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const currentSlide = slides[selectedSlide];
        if (!currentSlide) return;

        const elements = getElements(currentSlide);
        const updatedSlides = [...slides];
        updatedSlides[selectedSlide] = {
            ...currentSlide,
            elements: elements.filter(el => el.id !== elementId)
        };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
        setSelectedElement(null);
    };

    const moveElement = (elementId, direction) => {
        if (!currentPresentation) return;
        const slides = getSlides(currentPresentation);
        const currentSlide = slides[selectedSlide];
        if (!currentSlide) return;

        const elements = getElements(currentSlide);
        const index = elements.findIndex(el => el.id === elementId);
        if (index === -1) return;

        const newElements = [...elements];
        if (direction === 'up' && index < elements.length - 1) {
            [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        } else if (direction === 'down' && index > 0) {
            [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        }

        const updatedSlides = [...slides];
        updatedSlides[selectedSlide] = { ...currentSlide, elements: newElements };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
    };

    // ===============================
    // Touch & Keyboard Navigation
    // ===============================
    const handleTouchStart = useCallback((e) => {
        if (!isPresentMode) return;
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }, [isPresentMode]);

    const handleTouchEnd = useCallback((e) => {
        if (!isPresentMode || !currentPresentation) return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const threshold = 50;
        const slides = getSlides(currentPresentation);

        if (Math.abs(deltaX) > threshold) {
            if (deltaX < 0 && selectedSlide < slides.length - 1) {
                setSelectedSlide(prev => prev + 1);
            } else if (deltaX > 0 && selectedSlide > 0) {
                setSelectedSlide(prev => prev - 1);
            }
        }
    }, [isPresentMode, currentPresentation, selectedSlide]);

    useEffect(() => {
        if (!isPresentMode) return;
        const handleKeyDown = (e) => {
            const slides = getSlides(currentPresentation);
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                setSelectedSlide(prev => Math.min(prev + 1, slides.length - 1));
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSelectedSlide(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Escape') {
                setIsPresentMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPresentMode, currentPresentation]);

    // ===============================
    // Open presentation for editing or presenting
    // ===============================
    const openPresentation = (presentation, forPresenting = false) => {
        const normalized = {
            ...presentation,
            slides: Array.isArray(presentation.slides) ? presentation.slides : [createDefaultSlide()]
        };
        setCurrentPresentation(normalized);
        setSelectedSlide(0);
        if (forPresenting) {
            setIsPresentMode(true);
        } else {
            setIsEditing(true);
        }
    };

    // ===============================
    // Current slide data helper
    // ===============================
    const getCurrentSlideData = () => getSlide(currentPresentation, selectedSlide);
    const getSelectedElementData = () => {
        const slide = getCurrentSlideData();
        if (!slide || !selectedElement) return null;
        return getElements(slide).find(el => el.id === selectedElement) || null;
    };

    // ===============================
    // Presentation Mode
    // ===============================
    const PresentationMode = () => {
        const slides = getSlides(currentPresentation);
        const currentSlideData = slides[selectedSlide] || createDefaultSlide();
        const elements = getElements(currentSlideData);
        
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: '#000',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Exit button */}
                <button
                    onClick={() => setIsPresentMode(false)}
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 50,
                        height: 50,
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        zIndex: 10000
                    }}
                >
                    <i className="bi bi-x-lg"></i>
                </button>

                {/* Slide counter */}
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    fontSize: '1rem',
                    opacity: 0.7
                }}>
                    {selectedSlide + 1} / {slides.length}
                </div>

                {/* Slide content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlideData.id || selectedSlide}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            width: '90vw',
                            maxWidth: '1200px',
                            aspectRatio: '16/9',
                            background: currentSlideData.background || '#fff',
                            borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        {elements.map(element => (
                            <motion.div
                                key={element.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: element.opacity || 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    position: 'absolute',
                                    left: element.x,
                                    top: element.y,
                                    width: element.width,
                                    height: element.type === 'text' || element.type === 'heading' ? 'auto' : element.height,
                                    transform: `rotate(${element.rotation || 0}deg)`,
                                    ...element.style,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: element.style?.textAlign || 'center'
                                }}
                            >
                                {(element.type === 'text' || element.type === 'heading') && element.content}
                                {element.type === 'image' && element.src && (
                                    <img src={element.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: element.style?.borderRadius }} />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {selectedSlide > 0 && (
                    <button
                        onClick={() => setSelectedSlide(prev => prev - 1)}
                        style={{
                            position: 'absolute',
                            left: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 60,
                            height: 60,
                            color: '#fff',
                            fontSize: '2rem',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                )}
                {selectedSlide < slides.length - 1 && (
                    <button
                        onClick={() => setSelectedSlide(prev => prev + 1)}
                        style={{
                            position: 'absolute',
                            right: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 60,
                            height: 60,
                            color: '#fff',
                            fontSize: '2rem',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                )}
            </motion.div>
        );
    };

    // ===============================
    // Text Formatting Toolbar
    // ===============================
    const TextFormattingToolbar = ({ element }) => {
        if (!element || (element.type !== 'text' && element.type !== 'heading')) return null;

        return (
            <div className="d-flex flex-wrap align-items-center gap-2 p-2 mb-3" style={{ ...glassCard, padding: '8px' }}>
                {/* Font Family */}
                <select
                    className="form-select form-select-sm"
                    style={{ width: '140px' }}
                    value={element.style?.fontFamily?.split(',')[0] || 'AdventSans'}
                    onChange={(e) => updateElementStyle(element.id, { fontFamily: `${e.target.value}, sans-serif` })}
                >
                    {FONTS.map(font => (
                        <option key={font.name} value={font.name}>{font.label}</option>
                    ))}
                </select>

                {/* Font Size */}
                <select
                    className="form-select form-select-sm"
                    style={{ width: '80px' }}
                    value={element.style?.fontSize || 24}
                    onChange={(e) => updateElementStyle(element.id, { fontSize: parseInt(e.target.value) })}
                >
                    {[12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>

                {/* Bold */}
                <button
                    className={`btn btn-sm ${element.style?.fontWeight === 'bold' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateElementStyle(element.id, { fontWeight: element.style?.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    title="Negrita"
                >
                    <i className="bi bi-type-bold"></i>
                </button>

                {/* Italic */}
                <button
                    className={`btn btn-sm ${element.style?.fontStyle === 'italic' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateElementStyle(element.id, { fontStyle: element.style?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    title="Cursiva"
                >
                    <i className="bi bi-type-italic"></i>
                </button>

                {/* Underline */}
                <button
                    className={`btn btn-sm ${element.style?.textDecoration === 'underline' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateElementStyle(element.id, { textDecoration: element.style?.textDecoration === 'underline' ? 'none' : 'underline' })}
                    title="Subrayado"
                >
                    <i className="bi bi-type-underline"></i>
                </button>

                {/* Text Align */}
                <div className="btn-group">
                    <button
                        className={`btn btn-sm ${element.style?.textAlign === 'left' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => updateElementStyle(element.id, { textAlign: 'left' })}
                    >
                        <i className="bi bi-text-left"></i>
                    </button>
                    <button
                        className={`btn btn-sm ${element.style?.textAlign === 'center' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => updateElementStyle(element.id, { textAlign: 'center' })}
                    >
                        <i className="bi bi-text-center"></i>
                    </button>
                    <button
                        className={`btn btn-sm ${element.style?.textAlign === 'right' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => updateElementStyle(element.id, { textAlign: 'right' })}
                    >
                        <i className="bi bi-text-right"></i>
                    </button>
                </div>

                {/* Text Color */}
                <div className="d-flex align-items-center gap-1">
                    <span className="small text-muted">Color:</span>
                    <input
                        type="color"
                        className="form-control form-control-color p-0"
                        style={{ width: 30, height: 30 }}
                        value={element.style?.color || '#000000'}
                        onChange={(e) => updateElementStyle(element.id, { color: e.target.value })}
                    />
                </div>

                {/* Quick colors */}
                <div className="d-flex gap-1">
                    {COLORS.slice(0, 6).map(color => (
                        <button
                            key={color}
                            className="btn btn-sm p-0"
                            style={{ width: 24, height: 24, background: color, border: '2px solid #fff', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                            onClick={() => updateElementStyle(element.id, { color })}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // ===============================
    // Editor View
    // ===============================
    const EditorView = () => {
        const slides = getSlides(currentPresentation);
        const currentSlideData = getCurrentSlideData() || createDefaultSlide();
        const elements = getElements(currentSlideData);
        const selectedEl = getSelectedElementData();

        return (
            <div className="row g-3">
                {/* Text Formatting Toolbar - Full Width */}
                {selectedEl && (selectedEl.type === 'text' || selectedEl.type === 'heading') && (
                    <div className="col-12">
                        <TextFormattingToolbar element={selectedEl} />
                    </div>
                )}

                {/* Slide Panel (Left) */}
                <div className="col-12 col-lg-2">
                    <div style={glassCard} className="p-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fw-bold small text-muted">Diapositivas</span>
                            <button onClick={addSlide} className="btn btn-sm btn-primary rounded-circle" style={{ width: 28, height: 28, padding: 0 }}>
                                <i className="bi bi-plus"></i>
                            </button>
                        </div>
                        <div className="d-flex flex-column gap-2" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {slides.map((slide, index) => (
                                <motion.div
                                    key={slide.id || index}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setSelectedSlide(index); setSelectedElement(null); }}
                                    className="position-relative"
                                    style={{
                                        aspectRatio: '16/9',
                                        background: slide.background || '#fff',
                                        borderRadius: 8,
                                        border: selectedSlide === index ? `2px solid ${theme.colors.primary}` : '1px solid #ddd',
                                        cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <span className="position-absolute" style={{ top: 4, left: 6, fontSize: '0.65rem', fontWeight: 'bold', color: '#666', background: 'rgba(255,255,255,0.8)', padding: '0 4px', borderRadius: 3 }}>
                                        {index + 1}
                                    </span>
                                    {/* Mini preview */}
                                    <div style={{ transform: 'scale(0.12)', transformOrigin: 'top left', width: '833%', height: '833%', padding: 20 }}>
                                        {getElements(slide).map(el => (
                                            <div key={el.id} style={{
                                                position: 'absolute',
                                                left: el.x, top: el.y,
                                                width: el.width,
                                                fontSize: el.style?.fontSize,
                                                fontFamily: el.style?.fontFamily,
                                                color: el.style?.color,
                                                backgroundColor: el.style?.backgroundColor
                                            }}>
                                                {el.type === 'text' || el.type === 'heading' ? el.content : ''}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Actions */}
                                    <div className="position-absolute d-flex gap-1" style={{ bottom: 3, right: 3 }}>
                                        <button onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }} className="btn btn-sm p-0" style={{ width: 18, height: 18, fontSize: '0.55rem', background: 'rgba(255,255,255,0.9)' }}>
                                            <i className="bi bi-copy"></i>
                                        </button>
                                        {slides.length > 1 && (
                                            <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} className="btn btn-sm p-0" style={{ width: 18, height: 18, fontSize: '0.55rem', background: 'rgba(255,255,255,0.9)', color: '#dc3545' }}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas (Center) */}
                <div className="col-12 col-lg-7">
                    <div style={glassCard} className="p-3">
                        {/* Element Toolbar */}
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-3 pb-3 border-bottom">
                            <div className="btn-group">
                                <button onClick={() => addElement('heading')} className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-type-h1 me-1"></i> Título
                                </button>
                                <button onClick={() => addElement('text')} className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-fonts me-1"></i> Texto
                                </button>
                            </div>
                            <button onClick={() => addElement('shape')} className="btn btn-outline-primary btn-sm">
                                <i className="bi bi-square me-1"></i> Forma
                            </button>
                            <button onClick={() => addElement('image')} className="btn btn-outline-primary btn-sm">
                                <i className="bi bi-image me-1"></i> Imagen
                            </button>
                            <div className="ms-auto d-flex gap-2">
                                <button onClick={() => setIsPresentMode(true)} className="btn btn-primary btn-sm rounded-pill px-3">
                                    <i className="bi bi-play-fill me-1"></i> Proyectar
                                </button>
                                <button onClick={savePresentation} disabled={saving} className="btn btn-success btn-sm rounded-pill px-3">
                                    <i className={`bi ${saving ? 'bi-hourglass-split' : 'bi-save'} me-1`}></i>
                                    {saving ? '...' : 'Guardar'}
                                </button>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div
                            ref={canvasRef}
                            style={{
                                aspectRatio: '16/9',
                                background: currentSlideData.background || '#fff',
                                borderRadius: 12,
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => setSelectedElement(null)}
                        >
                            <AnimatePresence>
                                {elements.map(element => (
                                    <motion.div
                                        key={element.id}
                                        drag
                                        dragMomentum={false}
                                        onDragEnd={(_, info) => {
                                            updateElement(element.id, {
                                                x: Math.max(0, element.x + info.offset.x),
                                                y: Math.max(0, element.y + info.offset.y)
                                            });
                                        }}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElement(element.id); }}
                                        whileHover={{ boxShadow: `0 0 0 2px ${theme.colors.primary}40` }}
                                        style={{
                                            position: 'absolute',
                                            left: element.x,
                                            top: element.y,
                                            width: element.width,
                                            minHeight: element.type === 'text' || element.type === 'heading' ? 40 : element.height,
                                            height: element.type === 'text' || element.type === 'heading' ? 'auto' : element.height,
                                            cursor: 'move',
                                            transform: `rotate(${element.rotation || 0}deg)`,
                                            opacity: element.opacity || 1,
                                            ...element.style,
                                            outline: selectedElement === element.id ? `2px solid ${theme.colors.primary}` : 'none',
                                            outlineOffset: 2
                                        }}
                                    >
                                        {(element.type === 'text' || element.type === 'heading') && (
                                            <div
                                                contentEditable
                                                suppressContentEditableWarning
                                                onFocus={() => setEditingTextId(element.id)}
                                                onBlur={(e) => {
                                                    updateElement(element.id, { content: e.target.textContent });
                                                    setEditingTextId(null);
                                                }}
                                                style={{
                                                    outline: 'none',
                                                    width: '100%',
                                                    minHeight: '1em',
                                                    cursor: editingTextId === element.id ? 'text' : 'move'
                                                }}
                                            >
                                                {element.content}
                                            </div>
                                        )}
                                        {element.type === 'shape' && (
                                            <div style={{ width: '100%', height: '100%', borderRadius: element.style?.borderRadius }} />
                                        )}
                                        {element.type === 'image' && (
                                            <img
                                                src={element.src || 'https://via.placeholder.com/200x200?text=Imagen'}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: element.style?.borderRadius }}
                                            />
                                        )}
                                        {/* Resize handle */}
                                        {selectedElement === element.id && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    right: -6,
                                                    bottom: -6,
                                                    width: 12,
                                                    height: 12,
                                                    background: theme.colors.primary,
                                                    borderRadius: 2,
                                                    cursor: 'se-resize'
                                                }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    const startX = e.clientX;
                                                    const startY = e.clientY;
                                                    const startWidth = element.width;
                                                    const startHeight = element.height || 100;

                                                    const onMouseMove = (moveEvent) => {
                                                        const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
                                                        const newHeight = Math.max(30, startHeight + (moveEvent.clientY - startY));
                                                        updateElement(element.id, { width: newWidth, height: newHeight });
                                                    };

                                                    const onMouseUp = () => {
                                                        document.removeEventListener('mousemove', onMouseMove);
                                                        document.removeEventListener('mouseup', onMouseUp);
                                                    };

                                                    document.addEventListener('mousemove', onMouseMove);
                                                    document.addEventListener('mouseup', onMouseUp);
                                                }}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Properties Panel (Right) */}
                <div className="col-12 col-lg-3">
                    <div style={glassCard} className="p-3">
                        {selectedEl ? (
                            <>
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-sliders me-2"></i>
                                    Propiedades
                                </h6>
                                <div className="d-flex flex-column gap-3">
                                    {/* Position */}
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">X</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={Math.round(selectedEl.x)}
                                                onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">Y</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={Math.round(selectedEl.y)}
                                                onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">Ancho</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={selectedEl.width}
                                                onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 100 })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small text-muted mb-1">Alto</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={selectedEl.height || 'auto'}
                                                onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) || 100 })}
                                            />
                                        </div>
                                    </div>

                                    {/* Rotation */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">Rotación: {selectedEl.rotation || 0}°</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="-180"
                                            max="180"
                                            value={selectedEl.rotation || 0}
                                            onChange={(e) => updateElement(selectedEl.id, { rotation: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    {/* Opacity */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">Opacidad: {Math.round((selectedEl.opacity || 1) * 100)}%</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="0"
                                            max="100"
                                            value={(selectedEl.opacity || 1) * 100}
                                            onChange={(e) => updateElement(selectedEl.id, { opacity: parseInt(e.target.value) / 100 })}
                                        />
                                    </div>

                                    {/* Background color for shapes/text */}
                                    {(selectedEl.type === 'shape' || selectedEl.type === 'text' || selectedEl.type === 'heading') && (
                                        <div>
                                            <label className="form-label small text-muted mb-1">Color de fondo</label>
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color"
                                                    style={{ width: 40, height: 35 }}
                                                    value={selectedEl.style?.backgroundColor === 'transparent' ? '#ffffff' : (selectedEl.style?.backgroundColor || '#ffffff')}
                                                    onChange={(e) => updateElementStyle(selectedEl.id, { backgroundColor: e.target.value })}
                                                />
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => updateElementStyle(selectedEl.id, { backgroundColor: 'transparent' })}
                                                >
                                                    Sin fondo
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Border Radius */}
                                    <div>
                                        <label className="form-label small text-muted mb-1">Bordes redondeados: {selectedEl.style?.borderRadius || 0}px</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="0"
                                            max="100"
                                            value={selectedEl.style?.borderRadius || 0}
                                            onChange={(e) => updateElementStyle(selectedEl.id, { borderRadius: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    {/* Image URL */}
                                    {selectedEl.type === 'image' && (
                                        <div>
                                            <label className="form-label small text-muted mb-1">URL de imagen</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="https://..."
                                                value={selectedEl.src || ''}
                                                onChange={(e) => updateElement(selectedEl.id, { src: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {/* Layer controls */}
                                    <div className="d-flex gap-2">
                                        <button
                                            onClick={() => moveElement(selectedEl.id, 'up')}
                                            className="btn btn-sm btn-outline-secondary flex-fill"
                                            title="Traer al frente"
                                        >
                                            <i className="bi bi-layer-forward"></i> Adelante
                                        </button>
                                        <button
                                            onClick={() => moveElement(selectedEl.id, 'down')}
                                            className="btn btn-sm btn-outline-secondary flex-fill"
                                            title="Enviar atrás"
                                        >
                                            <i className="bi bi-layer-backward"></i> Atrás
                                        </button>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => deleteElement(selectedEl.id)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <i className="bi bi-trash me-1"></i> Eliminar elemento
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-easel me-2"></i>
                                    Diapositiva
                                </h6>
                                <div className="d-flex flex-column gap-3">
                                    <div>
                                        <label className="form-label small text-muted mb-1">Color de fondo</label>
                                        <div className="d-flex flex-wrap gap-1 mb-2">
                                            {COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    className="btn btn-sm p-0"
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        background: color,
                                                        border: currentSlideData.background === color ? `2px solid ${theme.colors.primary}` : '2px solid #ddd',
                                                        borderRadius: 4
                                                    }}
                                                    onClick={() => updateSlideBackground(color)}
                                                />
                                            ))}
                                        </div>
                                        <input
                                            type="color"
                                            className="form-control form-control-color w-100"
                                            value={currentSlideData.background || '#ffffff'}
                                            onChange={(e) => updateSlideBackground(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Presentation Info */}
                    <div style={glassCard} className="p-3 mt-3">
                        <h6 className="fw-bold mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Información
                        </h6>
                        <div className="d-flex flex-column gap-2">
                            <div>
                                <label className="form-label small text-muted mb-1">Título</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={currentPresentation?.title || ''}
                                    onChange={(e) => setCurrentPresentation({ ...currentPresentation, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label small text-muted mb-1">Descripción</label>
                                <textarea
                                    className="form-control form-control-sm"
                                    rows="2"
                                    value={currentPresentation?.description || ''}
                                    onChange={(e) => setCurrentPresentation({ ...currentPresentation, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ===============================
    // Main Render
    // ===============================
    return (
        <div className="container-fluid py-4">
            {/* Present Mode Overlay */}
            <AnimatePresence>
                {isPresentMode && currentPresentation && <PresentationMode />}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        {isEditing && (
                            <button
                                onClick={() => { setIsEditing(false); setCurrentPresentation(null); setSelectedElement(null); }}
                                className="btn btn-outline-secondary btn-sm rounded-pill"
                            >
                                <i className="bi bi-arrow-left me-1"></i> Volver
                            </button>
                        )}
                        <h4 className="mb-0 fw-bold" style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary }}>
                            <i className="bi bi-easel2-fill me-2"></i>
                            {isEditing ? (currentPresentation?.title || 'Editor') : 'Oasis Press'}
                        </h4>
                    </div>
                    {!isEditing && (
                        <button onClick={createPresentation} className="btn btn-primary rounded-pill px-4" style={glassPrimary}>
                            <i className="bi bi-plus-lg me-2"></i> Nueva Presentación
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : isEditing && currentPresentation ? (
                <EditorView />
            ) : (
                /* Presentations Grid */
                <div className="row g-4">
                    {(presentations || []).length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div style={{ ...glassCard, padding: '3rem' }}>
                                <i className="bi bi-easel2 display-1 text-muted mb-3 d-block"></i>
                                <h5 className="text-muted">No hay presentaciones aún</h5>
                                <p className="text-muted small">Crea tu primera presentación con estilo Liquid Glass</p>
                                <button onClick={createPresentation} className="btn btn-primary rounded-pill px-4 mt-2">
                                    <i className="bi bi-plus-lg me-2"></i> Crear Presentación
                                </button>
                            </div>
                        </div>
                    ) : (
                        (presentations || []).map((presentation, index) => (
                            <motion.div
                                key={presentation.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="col-12 col-sm-6 col-lg-4 col-xl-3"
                            >
                                <motion.div
                                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(91, 46, 166, 0.15)' }}
                                    style={{ ...glassCard, overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => openPresentation(presentation, false)}
                                >
                                    {/* Thumbnail */}
                                    <div
                                        style={{
                                            aspectRatio: '16/9',
                                            background: getSlide(presentation, 0)?.background || '#f0f0f0',
                                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div className="position-absolute" style={{ bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem' }}>
                                            {getSlides(presentation).length} slides
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <div className="p-3">
                                        <h6 className="fw-bold mb-1 text-truncate">{presentation.title || 'Sin título'}</h6>
                                        <p className="text-muted small mb-2 text-truncate">{presentation.description || 'Sin descripción'}</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="small text-muted">
                                                {presentation.updatedAt ? new Date(presentation.updatedAt).toLocaleDateString('es-ES') : ''}
                                            </span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openPresentation(presentation, true); }}
                                                    className="btn btn-sm btn-primary rounded-circle"
                                                    style={{ width: 32, height: 32, padding: 0 }}
                                                    title="Proyectar"
                                                >
                                                    <i className="bi bi-play-fill"></i>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deletePresentation(presentation.id); }}
                                                    className="btn btn-sm btn-outline-danger rounded-circle"
                                                    style={{ width: 32, height: 32, padding: 0 }}
                                                    title="Eliminar"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default OasisPress;
