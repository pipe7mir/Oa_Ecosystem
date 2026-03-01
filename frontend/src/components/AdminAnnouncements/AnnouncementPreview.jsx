import React, { useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Componente de vista previa del anuncio (lienzo)
 * Maneja la renderización y edición interactiva
 */
export const AnnouncementPreview = ({
  previewRef,
  formData,
  FORMATS,
  currentFmt,
  isMobile,
  selectedElementId,
  setSelectedElementId,
  setEditingElement,
  shapeMode,
  onCanvasClick,
  onCanvasTouchEnd,
  editingElement,
  editingValue,
  setEditingValue,
  handleElementDoubleClick,
  commitEdit,
  selectedFieldKey,
  set,
  assets,
  logoOasis,
  logoAdventista,
  rrssImage,
  previewBgStyle,
  children,
}) => {
  return (
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
      onClick={onCanvasClick}
      onTouchEnd={onCanvasTouchEnd}
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

      {/* Children Content - Content from parent */}
      {children}

      {/* Inline Text Editor Overlay */}
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
  );
};

export default AnnouncementPreview;
