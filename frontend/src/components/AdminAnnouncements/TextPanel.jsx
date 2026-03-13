import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../react-ui/ThemeContext';

/**
 * Componente del panel de opciones de texto avanzadas
 * Gestiona fuentes, tamaños, colores, opacidad y efectos de sombra
 */
export const TextPanel = ({
  showTextPanel,
  setShowTextPanel,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textColor,
  setTextColor,
  textOpacity,
  setTextOpacity,
  textShadow,
  setTextShadow,
  letterSpacing,
  setLetterSpacing,
  lineHeight,
  setLineHeight,
  isMobile,
}) => {
  const { theme, mode } = useTheme();
  const fontFamilies = [
    'Arial',
    'Georgia',
    'Times New Roman',
    'Verdana',
    'Comic Sans MS',
    'Trebuchet MS',
    'Impact',
    'Courier New',
    'Palatino',
    'Garamond',
  ];

  const fontSizeOptions = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];

  const textColorPresets = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#808080',
    '#FFA500',
  ];

  const shadowPresets = [
    { name: 'Sin sombra', value: 'none' },
    { name: 'Sutil', value: '2px 2px 4px rgba(0,0,0,0.3)' },
    { name: 'Medio', value: '3px 3px 8px rgba(0,0,0,0.5)' },
    { name: 'Fuerte', value: '5px 5px 12px rgba(0,0,0,0.7)' },
    { name: 'Contorno blanco', value: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' },
    { name: 'Contorno negro', value: '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black' },
  ];

  const panelVariants = {
    hidden: { opacity: 0, x: '-100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { opacity: 0, x: '-100%', transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {showTextPanel && (
        <motion.div
          className="text-panel shadow-lg border-end"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: 'fixed',
            top: '40px',
            left: 0,
            bottom: 0,
            width: isMobile ? '100%' : '300px',
            zIndex: 1150,
            overflowY: 'auto',
            borderRadius: '0',
            background: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          {/* Header */}
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center sticky-top" style={{ background: theme.colors.surface, borderColor: theme.colors.border }}>
            <h6 className="fw-bold mb-0" style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.accent, letterSpacing: '1px' }}>
              <i className="bi bi-fonts"></i> TEXTO
            </h6>
            <button className="btn-close" onClick={() => setShowTextPanel(false)}></button>
          </div>

          <div className="p-3">
            {/* Familia de fuentes */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-type"></i> Familia de Fuente
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="form-select form-select-sm"
                style={{ fontSize: '0.8rem' }}
              >
                {fontFamilies.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Tamaño de fuente */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-rulers"></i> Tamaño: <span className="text-primary">{fontSize}px</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="8"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
              <div className="d-flex flex-wrap gap-2 mt-2">
                {fontSizeOptions.map((size) => (
                  <motion.button
                    key={size}
                    className={`btn btn-sm ${fontSize === size ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFontSize(size)}
                    whileTap={{ scale: 0.95 }}
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Color de texto */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-palette"></i> Color de Texto
              </label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {textColorPresets.map((color) => (
                  <motion.div
                    key={color}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: color,
                      border: textColor === color ? '3px solid #0d6efd' : '1px solid #999',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setTextColor(color)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="form-control form-control-color"
                style={{ height: '40px', cursor: 'pointer' }}
                title="Selector personalizado"
              />
            </div>

            {/* Separador */}
            <hr />

            {/* Opacidad del texto */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-transparency"></i> Opacidad: <span className="text-primary">{(textOpacity * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="1"
                step="0.1"
                value={textOpacity}
                onChange={(e) => setTextOpacity(Number(e.target.value))}
              />
            </div>

            {/* Separador */}
            <hr />

            {/* Espaciado entre letras */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-distribute-horizontal"></i> Espaciado de Letras: <span className="text-primary">{letterSpacing}px</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="-2"
                max="10"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
              />
            </div>

            {/* Separador */}
            <hr />

            {/* Alto de línea */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-arrow-up-down"></i> Alto de Línea: <span className="text-primary">{lineHeight}</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
              />
            </div>

            {/* Separador */}
            <hr />

            {/* Efectos de sombra */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-cloud-haze2"></i> Efecto de Sombra
              </label>
              <div className="d-grid gap-2">
                {shadowPresets.map((shadow, idx) => (
                  <motion.button
                    key={idx}
                    className={`btn btn-sm btn-outline-secondary text-start`}
                    onClick={() => setTextShadow(shadow.value)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.5rem',
                      border: textShadow === shadow.value ? '2px solid #0d6efd' : '1px solid #dee2e6',
                      borderRadius: '0.5rem',
                      background: textShadow === shadow.value ? '#e7f1ff' : 'white',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span style={{ textShadow: shadow.value, fontWeight: 'bold' }}>
                      {shadow.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Información de ayuda */}
            <div className="alert alert-info" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-info-circle"></i> Utiliza los controles anteriores para personalizar completamente el
              aspecto del texto en tu anuncio.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextPanel;
