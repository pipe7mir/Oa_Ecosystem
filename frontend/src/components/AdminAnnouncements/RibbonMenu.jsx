import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente del menú ribbon (barra de herramientas de formateo)
 * Contiene botones para formato, fuente, color, alineación, tamaño, etc.
 */
export const RibbonMenu = ({
  activeFormat,
  setActiveFormat,
  fontSize,
  setFontSize,
  selectedColor,
  setSelectedColor,
  textAlign,
  setTextAlign,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  isUnderline,
  setIsUnderline,
  fontFamily,
  setFontFamily,
  selectedElement,
  onDeleteElement,
  theme,
  isMobile,
}) => {
  const ribbonVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const fontFamilies = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Comic Sans MS'];
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

  return (
    <motion.div
      className="ribbon-menu bg-light border-bottom p-2"
      variants={ribbonVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
      }}
    >
      {/* Formato de texto */}
      <div className="btn-group btn-group-sm" role="group">
        {['normal', 'h1', 'h2', 'h3', 'body'].map((format) => (
          <button
            key={format}
            type="button"
            className={`btn ${activeFormat === format ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveFormat(format)}
            title={`Formato: ${format}`}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            {format === 'h1' && 'H1'}
            {format === 'h2' && 'H2'}
            {format === 'h3' && 'H3'}
            {format === 'normal' && 'Normal'}
            {format === 'body' && 'Body'}
          </button>
        ))}
      </div>

      {/* Separador visual */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }}></div>

      {/* Familia de fuentes */}
      <select
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
        className="form-select form-select-sm"
        title="Familia de fuentes"
        style={{ width: isMobile ? '80px' : '120px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
      >
        {fontFamilies.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {/* Tamaño de fuente */}
      <select
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="form-select form-select-sm"
        title="Tamaño de fuente"
        style={{ width: '60px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
      >
        {fontSizes.map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>

      {/* Separador visual */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }}></div>

      {/* Estilos de texto (Negrita, Cursiva, Subrayado) */}
      <div className="btn-group btn-group-sm" role="group">
        <button
          type="button"
          className={`btn ${isBold ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setIsBold(!isBold)}
          title="Negrita"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', fontWeight: 'bold' }}
        >
          B
        </button>
        <button
          type="button"
          className={`btn ${isItalic ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setIsItalic(!isItalic)}
          title="Cursiva"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', fontStyle: 'italic' }}
        >
          I
        </button>
        <button
          type="button"
          className={`btn ${isUnderline ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setIsUnderline(!isUnderline)}
          title="Subrayado"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textDecoration: 'underline' }}
        >
          U
        </button>
      </div>

      {/* Separador visual */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }}></div>

      {/* Alineación de texto */}
      <div className="btn-group btn-group-sm" role="group">
        {['left', 'center', 'right', 'justify'].map((align) => (
          <button
            key={align}
            type="button"
            className={`btn ${textAlign === align ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setTextAlign(align)}
            title={`Alineación ${align}`}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            <i className={`bi bi-text-${align === 'justify' ? 'justify' : `align-${align}`}`}></i>
          </button>
        ))}
      </div>

      {/* Separador visual */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }}></div>

      {/* Selector de color */}
      <div className="d-flex align-items-center gap-2">
        <label style={{ fontSize: '0.75rem', marginBottom: 0 }}>Color:</label>
        <div className="d-flex gap-1">
          {[
            '#000000',
            '#FFFFFF',
            '#FF0000',
            '#00FF00',
            '#0000FF',
            '#FFFF00',
            '#FF00FF',
            '#00FFFF',
          ].map((color) => (
            <div
              key={color}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: color,
                border: selectedColor === color ? '3px solid #333' : '1px solid #999',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            style={{
              width: '24px',
              height: '24px',
              padding: '2px',
              border: '1px solid #999',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Selector de color personalizado"
          />
        </div>
      </div>

      {/* Separador visual */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }}></div>

      {/* Botón eliminar elemento seleccionado */}
      {selectedElement && (
        <button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={onDeleteElement}
          title="Eliminar elemento seleccionado"
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        >
          <i className="bi bi-trash"></i> Eliminar
        </button>
      )}
    </motion.div>
  );
};

export default RibbonMenu;
