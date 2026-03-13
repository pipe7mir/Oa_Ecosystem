import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente del panel de diseño (templates, colores de fondo, gradientes, imágenes)
 */
export const DesignPanel = ({
  showDesignPanel,
  setShowDesignPanel,
  templates,
  onSelectTemplate,
  backgroundGradient,
  setBackgroundGradient,
  backgroundColor,
  setBackgroundColor,
  backgroundImage,
  onUploadBackgroundImage,
  theme,
  isMobile,
  presets,
}) => {
  const gradientPresets = [
    { name: 'Azul a Púrpura', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Rojo a Naranja', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Verde a Azul', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Amarillo a Naranja', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Púrpura a Rosa', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { name: 'Oscuro a Gris', value: 'linear-gradient(135deg, #667eea 0%, #0f2027 100%)' },
  ];

  const solidColors = [
    '#FFFFFF',
    '#F5F5F5',
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
  ];

  const panelVariants = {
    hidden: { opacity: 0, x: '-100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { opacity: 0, x: '-100%', transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {showDesignPanel && (
        <motion.div
          className="design-panel border-end shadow-lg"
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
            <h6 className="fw-bold mb-0" style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.accent, letterSpacing: '1px' }}>DISEÑO</h6>
            <button
              className="btn-close"
              onClick={() => setShowDesignPanel(false)}
            ></button>
          </div>

          <div className="p-3">
            {/* Plantillas */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-palette"></i> Plantillas Predefinidas
              </h6>
              <div className="d-grid gap-2">
                {templates.map((template, idx) => (
                  <motion.button
                    key={idx}
                    className="btn btn-outline-primary btn-sm text-start"
                    onClick={() => {
                      onSelectTemplate(template);
                      setShowDesignPanel(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      height: '60px',
                      overflow: 'hidden',
                      borderRadius: '0.5rem',
                      background: template.backgroundGradient || template.backgroundColor,
                      border: '2px solid #dee2e6',
                      color: template.textColor || '#000',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {template.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Colores sólidos */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-square-fill"></i> Colores Sólidos
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {solidColors.map((color) => (
                  <motion.div
                    key={color}
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: color,
                      border: backgroundColor === color ? '3px solid #0d6efd' : '1px solid #999',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => {
                      setBackgroundColor(color);
                      setBackgroundGradient(null);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={color}
                  />
                ))}
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    setBackgroundGradient(null);
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid #999',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title="Selector personalizado"
                />
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Gradientes */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-gradient"></i> Gradientes
              </h6>
              <div className="d-grid gap-2">
                {gradientPresets.map((gradient, idx) => (
                  <motion.button
                    key={idx}
                    className={`btn btn-sm text-white fw-semibold`}
                    onClick={() => {
                      setBackgroundGradient(gradient.value);
                      setBackgroundColor(null);
                    }}
                    style={{
                      background: gradient.value,
                      border: backgroundGradient === gradient.value ? '3px solid #fff' : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      padding: '0.5rem',
                      boxShadow: backgroundGradient === gradient.value ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {gradient.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Imagen de fondo */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-image"></i> Imagen de Fondo
              </h6>
              {backgroundImage && (
                <div
                  className="mb-2 position-relative"
                  style={{
                    width: '100%',
                    height: '100px',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '0.5rem',
                    border: '1px solid #dee2e6',
                  }}
                >
                  <button
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    onClick={() => onUploadBackgroundImage(null)}
                    style={{ fontSize: '0.65rem' }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              )}
              <label className="btn btn-outline-secondary btn-sm w-100">
                <i className="bi bi-cloud-upload"></i> Subir Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        onUploadBackgroundImage(event.target.result);
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Separador */}
            <hr />

            {/* Presets guardados */}
            {presets && presets.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-bookmark"></i> Mis Favoritos
                </h6>
                <div className="d-grid gap-2">
                  {presets.map((preset, idx) => (
                    <motion.button
                      key={idx}
                      className="btn btn-outline-success btn-sm text-start"
                      onClick={() => {
                        onSelectTemplate(preset);
                        setShowDesignPanel(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                      }}
                    >
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      {preset.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DesignPanel;
