import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../react-ui/styles/theme';
import apiClient from '../api/client';

// ===============================
// OASIS PRESS - Presentation Editor
// ===============================
// Liquid Glass aesthetics + Framer Motion morph transitions
// Touch-optimized with gesture support

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
            setPresentations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching presentations:', error);
            setPresentations([]);
        } finally {
            setLoading(false);
        }
    };

    const createPresentation = async () => {
        try {
            const newPresentation = await apiClient.post('/presentations', {
                title: 'Nueva Presentación',
                description: '',
                slides: [{
                    id: `slide-${Date.now()}`,
                    order: 0,
                    background: '#ffffff',
                    elements: [],
                    transition: 'morph'
                }],
                settings: {
                    aspectRatio: '16:9',
                    defaultTransition: 'morph'
                }
            });
            setPresentations(prev => [newPresentation, ...prev]);
            setCurrentPresentation(newPresentation);
            setSelectedSlide(0);
            setIsEditing(true);
        } catch (error) {
            console.error('Error creating presentation:', error);
        }
    };

    const savePresentation = async () => {
        if (!currentPresentation) return;
        setSaving(true);
        try {
            const updated = await apiClient.put(`/presentations/${currentPresentation.id}`, currentPresentation);
            setPresentations(prev => prev.map(p => p.id === updated.id ? updated : p));
            setCurrentPresentation(updated);
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
            setPresentations(prev => prev.filter(p => p.id !== id));
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
        const newSlide = {
            id: `slide-${Date.now()}`,
            order: currentPresentation.slides.length,
            background: '#ffffff',
            elements: [],
            transition: 'morph'
        };
        const updated = {
            ...currentPresentation,
            slides: [...currentPresentation.slides, newSlide]
        };
        setCurrentPresentation(updated);
        setSelectedSlide(updated.slides.length - 1);
    };

    const deleteSlide = (index) => {
        if (!currentPresentation || currentPresentation.slides.length <= 1) return;
        const updated = {
            ...currentPresentation,
            slides: currentPresentation.slides.filter((_, i) => i !== index)
        };
        setCurrentPresentation(updated);
        setSelectedSlide(Math.max(0, index - 1));
    };

    const duplicateSlide = (index) => {
        if (!currentPresentation) return;
        const slideToCopy = currentPresentation.slides[index];
        const newSlide = {
            ...JSON.parse(JSON.stringify(slideToCopy)),
            id: `slide-${Date.now()}`
        };
        const newSlides = [...currentPresentation.slides];
        newSlides.splice(index + 1, 0, newSlide);
        setCurrentPresentation({ ...currentPresentation, slides: newSlides });
        setSelectedSlide(index + 1);
    };

    // ===============================
    // Element Management
    // ===============================
    const addElement = (type) => {
        if (!currentPresentation) return;
        const newElement = {
            id: `el-${Date.now()}`,
            type,
            x: 50,
            y: 50,
            width: type === 'text' ? 300 : 200,
            height: type === 'text' ? 60 : 200,
            content: type === 'text' ? 'Nuevo texto' : '',
            layoutId: `morph-${Date.now()}`,
            style: {
                fontSize: 24,
                fontFamily: 'AdventSans, sans-serif',
                color: theme.colors.text.primary,
                backgroundColor: type === 'shape' ? theme.colors.primary : 'transparent',
                borderRadius: 8,
                textAlign: 'center',
                padding: 12
            }
        };
        
        const updatedSlides = [...currentPresentation.slides];
        updatedSlides[selectedSlide] = {
            ...updatedSlides[selectedSlide],
            elements: [...updatedSlides[selectedSlide].elements, newElement]
        };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
        setSelectedElement(newElement.id);
    };

    const updateElement = (elementId, updates) => {
        if (!currentPresentation) return;
        const updatedSlides = [...currentPresentation.slides];
        const slideElements = updatedSlides[selectedSlide].elements.map(el =>
            el.id === elementId ? { ...el, ...updates } : el
        );
        updatedSlides[selectedSlide] = { ...updatedSlides[selectedSlide], elements: slideElements };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
    };

    const deleteElement = (elementId) => {
        if (!currentPresentation) return;
        const updatedSlides = [...currentPresentation.slides];
        updatedSlides[selectedSlide] = {
            ...updatedSlides[selectedSlide],
            elements: updatedSlides[selectedSlide].elements.filter(el => el.id !== elementId)
        };
        setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
        setSelectedElement(null);
    };

    // ===============================
    // Touch Gesture Handling
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

        if (Math.abs(deltaX) > threshold) {
            if (deltaX < 0 && selectedSlide < currentPresentation.slides.length - 1) {
                setSelectedSlide(prev => prev + 1);
            } else if (deltaX > 0 && selectedSlide > 0) {
                setSelectedSlide(prev => prev - 1);
            }
        }
    }, [isPresentMode, currentPresentation, selectedSlide]);

    // Keyboard navigation in present mode
    useEffect(() => {
        if (!isPresentMode) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                setSelectedSlide(prev => Math.min(prev + 1, (currentPresentation?.slides.length || 1) - 1));
            } else if (e.key === 'ArrowLeft') {
                setSelectedSlide(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Escape') {
                setIsPresentMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPresentMode, currentPresentation]);

    // ===============================
    // Presentation Mode
    // ===============================
    const PresentationMode = () => {
        const currentSlideData = currentPresentation?.slides[selectedSlide];
        
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
                    {selectedSlide + 1} / {currentPresentation?.slides.length}
                </div>

                {/* Slide content with morph animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlideData?.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            width: '90vw',
                            maxWidth: '1200px',
                            aspectRatio: '16/9',
                            background: currentSlideData?.background || '#fff',
                            borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        {(currentSlideData?.elements || []).map(element => (
                            <motion.div
                                key={element.id}
                                layoutId={element.layoutId}
                                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                style={{
                                    position: 'absolute',
                                    left: `${element.x}px`,
                                    top: `${element.y}px`,
                                    width: `${element.width}px`,
                                    height: element.type === 'text' ? 'auto' : `${element.height}px`,
                                    ...element.style,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: element.style?.textAlign || 'center'
                                }}
                            >
                                {element.type === 'text' && element.content}
                                {element.type === 'image' && (
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
                {selectedSlide < (currentPresentation?.slides.length || 1) - 1 && (
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
    // Editor View
    // ===============================
    const EditorView = () => {
        const currentSlideData = currentPresentation?.slides[selectedSlide];
        const selectedEl = currentSlideData?.elements.find(el => el.id === selectedElement);

        return (
            <div className="row g-4">
                {/* Slide Panel (Left) */}
                <div className="col-12 col-lg-2">
                    <div style={glassCard} className="p-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fw-bold small text-muted">Diapositivas</span>
                            <button onClick={addSlide} className="btn btn-sm btn-primary rounded-circle" style={{ width: 28, height: 28, padding: 0 }}>
                                <i className="bi bi-plus"></i>
                            </button>
                        </div>
                        <div className="d-flex flex-column gap-2" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {(currentPresentation?.slides || []).map((slide, index) => (
                                <motion.div
                                    key={slide.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedSlide(index)}
                                    className={`position-relative ${selectedSlide === index ? 'ring-2' : ''}`}
                                    style={{
                                        aspectRatio: '16/9',
                                        background: slide.background || '#fff',
                                        borderRadius: 8,
                                        border: selectedSlide === index ? `2px solid ${theme.colors.primary}` : '1px solid #ddd',
                                        cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <span className="position-absolute" style={{ top: 4, left: 6, fontSize: '0.65rem', fontWeight: 'bold', color: '#666' }}>
                                        {index + 1}
                                    </span>
                                    {/* Slide thumbnail preview */}
                                    <div style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: '666%', height: '666%' }}>
                                        {(slide.elements || []).map(el => (
                                            <div key={el.id} style={{
                                                position: 'absolute',
                                                left: el.x, top: el.y,
                                                width: el.width, height: el.height,
                                                ...el.style
                                            }}>
                                                {el.type === 'text' && el.content}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Context menu */}
                                    <div className="position-absolute d-flex gap-1" style={{ bottom: 4, right: 4 }}>
                                        <button onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }} className="btn btn-sm p-0" style={{ width: 20, height: 20, fontSize: '0.6rem', background: 'rgba(255,255,255,0.8)' }}>
                                            <i className="bi bi-copy"></i>
                                        </button>
                                        {currentPresentation.slides.length > 1 && (
                                            <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} className="btn btn-sm p-0" style={{ width: 20, height: 20, fontSize: '0.6rem', background: 'rgba(255,255,255,0.8)', color: '#dc3545' }}>
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
                    <div style={glassCard} className="p-4">
                        {/* Toolbar */}
                        <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom">
                            <button onClick={() => addElement('text')} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                                <i className="bi bi-fonts me-1"></i> Texto
                            </button>
                            <button onClick={() => addElement('shape')} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                                <i className="bi bi-square me-1"></i> Forma
                            </button>
                            <button onClick={() => addElement('image')} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                                <i className="bi bi-image me-1"></i> Imagen
                            </button>
                            <div className="ms-auto d-flex gap-2">
                                <button onClick={() => setIsPresentMode(true)} className="btn btn-primary btn-sm rounded-pill px-3">
                                    <i className="bi bi-play-fill me-1"></i> Proyectar
                                </button>
                                <button onClick={savePresentation} disabled={saving} className="btn btn-success btn-sm rounded-pill px-3">
                                    <i className={`bi ${saving ? 'bi-hourglass-split' : 'bi-save'} me-1`}></i>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>

                        {/* Canvas area */}
                        <div
                            ref={canvasRef}
                            style={{
                                aspectRatio: '16/9',
                                background: currentSlideData?.background || '#fff',
                                borderRadius: 12,
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => setSelectedElement(null)}
                        >
                            <AnimatePresence>
                                {(currentSlideData?.elements || []).map(element => (
                                    <motion.div
                                        key={element.id}
                                        layoutId={element.layoutId}
                                        drag
                                        dragMomentum={false}
                                        onDragEnd={(_, info) => {
                                            updateElement(element.id, {
                                                x: element.x + info.offset.x,
                                                y: element.y + info.offset.y
                                            });
                                        }}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElement(element.id); }}
                                        whileHover={{ boxShadow: '0 0 0 2px ' + theme.colors.primary }}
                                        style={{
                                            position: 'absolute',
                                            left: element.x,
                                            top: element.y,
                                            width: element.width,
                                            height: element.type === 'text' ? 'auto' : element.height,
                                            cursor: 'move',
                                            ...element.style,
                                            outline: selectedElement === element.id ? `2px solid ${theme.colors.primary}` : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: element.style?.textAlign || 'center'
                                        }}
                                    >
                                        {element.type === 'text' && (
                                            <div
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => updateElement(element.id, { content: e.target.textContent })}
                                                style={{ outline: 'none', width: '100%' }}
                                            >
                                                {element.content}
                                            </div>
                                        )}
                                        {element.type === 'shape' && (
                                            <div style={{ width: '100%', height: '100%', borderRadius: element.style?.borderRadius }} />
                                        )}
                                        {element.type === 'image' && (
                                            <img src={element.src || '/img/placeholder.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: element.style?.borderRadius }} />
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
                                <h6 className="fw-bold mb-3">Propiedades</h6>
                                <div className="d-flex flex-column gap-3">
                                    {selectedEl.type === 'text' && (
                                        <>
                                            <div>
                                                <label className="form-label small text-muted">Tamaño de fuente</label>
                                                <input
                                                    type="range"
                                                    className="form-range"
                                                    min="12"
                                                    max="120"
                                                    value={selectedEl.style?.fontSize || 24}
                                                    onChange={(e) => updateElement(selectedEl.id, { style: { ...selectedEl.style, fontSize: parseInt(e.target.value) } })}
                                                />
                                                <span className="small">{selectedEl.style?.fontSize || 24}px</span>
                                            </div>
                                            <div>
                                                <label className="form-label small text-muted">Color del texto</label>
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color w-100"
                                                    value={selectedEl.style?.color || '#000000'}
                                                    onChange={(e) => updateElement(selectedEl.id, { style: { ...selectedEl.style, color: e.target.value } })}
                                                />
                                            </div>
                                        </>
                                    )}
                                    {(selectedEl.type === 'shape' || selectedEl.type === 'text') && (
                                        <div>
                                            <label className="form-label small text-muted">Color de fondo</label>
                                            <input
                                                type="color"
                                                className="form-control form-control-color w-100"
                                                value={selectedEl.style?.backgroundColor || '#5b2ea6'}
                                                onChange={(e) => updateElement(selectedEl.id, { style: { ...selectedEl.style, backgroundColor: e.target.value } })}
                                            />
                                        </div>
                                    )}
                                    {selectedEl.type === 'image' && (
                                        <div>
                                            <label className="form-label small text-muted">URL de imagen</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="https://..."
                                                value={selectedEl.src || ''}
                                                onChange={(e) => updateElement(selectedEl.id, { src: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="form-label small text-muted">Ancho</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={selectedEl.width}
                                            onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label small text-muted">Alto</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={selectedEl.height}
                                            onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label small text-muted">Bordes redondeados</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="0"
                                            max="50"
                                            value={selectedEl.style?.borderRadius || 0}
                                            onChange={(e) => updateElement(selectedEl.id, { style: { ...selectedEl.style, borderRadius: parseInt(e.target.value) } })}
                                        />
                                    </div>
                                    <button
                                        onClick={() => deleteElement(selectedEl.id)}
                                        className="btn btn-outline-danger btn-sm rounded-pill mt-2"
                                    >
                                        <i className="bi bi-trash me-1"></i> Eliminar elemento
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h6 className="fw-bold mb-3">Diapositiva</h6>
                                <div>
                                    <label className="form-label small text-muted">Color de fondo</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color w-100"
                                        value={currentSlideData?.background || '#ffffff'}
                                        onChange={(e) => {
                                            const updatedSlides = [...currentPresentation.slides];
                                            updatedSlides[selectedSlide] = { ...updatedSlides[selectedSlide], background: e.target.value };
                                            setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
                                        }}
                                    />
                                </div>
                                <div className="mt-3">
                                    <label className="form-label small text-muted">Transición</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={currentSlideData?.transition || 'morph'}
                                        onChange={(e) => {
                                            const updatedSlides = [...currentPresentation.slides];
                                            updatedSlides[selectedSlide] = { ...updatedSlides[selectedSlide], transition: e.target.value };
                                            setCurrentPresentation({ ...currentPresentation, slides: updatedSlides });
                                        }}
                                    >
                                        <option value="morph">Morph / Zoom</option>
                                        <option value="fade">Desvanecer</option>
                                        <option value="slide">Deslizar</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Presentation Info */}
                    <div style={glassCard} className="p-3 mt-3">
                        <h6 className="fw-bold mb-3">Información</h6>
                        <div className="d-flex flex-column gap-2">
                            <div>
                                <label className="form-label small text-muted">Título</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={currentPresentation?.title || ''}
                                    onChange={(e) => setCurrentPresentation({ ...currentPresentation, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label small text-muted">Descripción</label>
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
                                onClick={() => { setIsEditing(false); setCurrentPresentation(null); }}
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
                    {presentations.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div style={{ ...glassCard, padding: '3rem' }}>
                                <i className="bi bi-easel2 display-1 text-muted mb-3"></i>
                                <h5 className="text-muted">No hay presentaciones aún</h5>
                                <p className="text-muted small">Crea tu primera presentación con estilo Liquid Glass</p>
                                <button onClick={createPresentation} className="btn btn-primary rounded-pill px-4 mt-2">
                                    <i className="bi bi-plus-lg me-2"></i> Crear Presentación
                                </button>
                            </div>
                        </div>
                    ) : (
                        presentations.map((presentation, index) => (
                            <motion.div
                                key={presentation.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="col-12 col-sm-6 col-lg-4 col-xl-3"
                            >
                                <motion.div
                                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(91, 46, 166, 0.15)' }}
                                    style={{ ...glassCard, overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => { setCurrentPresentation(presentation); setSelectedSlide(0); setIsEditing(true); }}
                                >
                                    {/* Thumbnail */}
                                    <div
                                        style={{
                                            aspectRatio: '16/9',
                                            background: presentation.slides?.[0]?.background || '#f0f0f0',
                                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div className="position-absolute" style={{ bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem' }}>
                                            {presentation.slides?.length || 0} slides
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <div className="p-3">
                                        <h6 className="fw-bold mb-1 text-truncate">{presentation.title}</h6>
                                        <p className="text-muted small mb-2 text-truncate">{presentation.description || 'Sin descripción'}</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="small text-muted">
                                                {new Date(presentation.updatedAt).toLocaleDateString('es-ES')}
                                            </span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setCurrentPresentation(presentation); setSelectedSlide(0); setIsPresentMode(true); }}
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
