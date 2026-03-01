import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente del panel de marca (logo, posicionamiento, tamaño)
 */
export const BrandPanel = ({
  showBrandPanel,
  setShowBrandPanel,
  logoOasis,
  selectedLogo,
  setSelectedLogo,
  logoSize,
  setLogoSize,
  logoPosition,
  setLogoPosition,
  logoOpacity,
  setLogoOpacity,
  onUploadLogo,
  availableLogos,
  isMobile,
}) => {
  const logoPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
  const logoSizeOptions = [40, 60, 80, 100, 120, 140, 160, 180, 200];

  const positionLabels = {
    'top-left': 'Arriba Izquierda',
    'top-right': 'Arriba Derecha',
    'bottom-left': 'Abajo Izquierda',
    'bottom-right': 'Abajo Derecha',
    'center': 'Centro',
  };

  const panelVariants = {
    hidden: { opacity: 0, x: '-100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { opacity: 0, x: '-100%', transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {showBrandPanel && (
        <motion.div
          className="brand-panel bg-white border-end shadow-lg"
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
          }}
        >
          {/* Header */}
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white">
            <h6 className="fw-bold mb-0">
              <i className="bi bi-shield-badge"></i> MARCA
            </h6>
            <button className="btn-close" onClick={() => setShowBrandPanel(false)}></button>
          </div>

          <div className="p-3">
            {/* Vista previa del logo actual */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-image"></i> Logo Actual
              </label>
              <div
                style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: '#f5f5f5',
                  border: '2px dashed #dee2e6',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {selectedLogo || logoOasis ? (
                  <img
                    src={selectedLogo || logoOasis}
                    alt="Logo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      opacity: logoOpacity,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#999' }}>Sin logo</span>
                )}
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Logos disponibles */}
            {availableLogos && availableLogos.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-collection"></i> Logos Disponibles
                </label>
                <div className="d-grid gap-2">
                  {availableLogos.map((logo, idx) => (
                    <motion.button
                      key={idx}
                      className={`btn btn-sm`}
                      onClick={() => setSelectedLogo(logo.url)}
                      style={{
                        height: '80px',
                        backgroundColor: selectedLogo === logo.url ? '#e7f1ff' : '#f5f5f5',
                        border: selectedLogo === logo.url ? '2px solid #0d6efd' : '1px solid #dee2e6',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title={logo.name}
                    >
                      <img
                        src={logo.url}
                        alt={logo.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Separador */}
            <hr />

            {/* Subir logo personalizado */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-cloud-upload"></i> Logo Personalizado
              </label>
              <label className="btn btn-outline-secondary btn-sm w-100">
                <i className="bi bi-upload"></i> Subir Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        onUploadLogo(event.target.result);
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

            {/* Tamaño del logo */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-rulers"></i> Tamaño: <span className="text-primary">{logoSize}px</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="40"
                max="200"
                step="10"
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
              />
              <div className="d-flex flex-wrap gap-1 mt-2">
                {logoSizeOptions.map((size) => (
                  <motion.button
                    key={size}
                    className={`btn btn-xs ${logoSize === size ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setLogoSize(size)}
                    whileTap={{ scale: 0.95 }}
                    style={{ fontSize: '0.65rem', padding: '0.25rem 0.4rem' }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Posición del logo */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-layout-split"></i> Posición
              </label>
              <div className="d-grid gap-2">
                {logoPositions.map((position) => (
                  <motion.button
                    key={position}
                    className={`btn btn-sm ${logoPosition === position ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setLogoPosition(position)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                  >
                    {positionLabels[position]}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <hr />

            {/* Opacidad del logo */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-transparency"></i> Opacidad: <span className="text-primary">{(logoOpacity * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="1"
                step="0.1"
                value={logoOpacity}
                onChange={(e) => setLogoOpacity(Number(e.target.value))}
              />
            </div>

            {/* Separador */}
            <hr />

            {/* Información de ayuda */}
            <div className="alert alert-info" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-info-circle"></i> Personaliza el logo de tu iglesia/organización en todos tus
              anuncios.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandPanel;
