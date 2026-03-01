import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente de lista de anuncios guardados (drawer derecho)
 */
export const AnnouncementsList = ({
  showForm,
  setShowForm,
  announcements,
  handleEdit,
  handleDelete,
  logoOasis,
  isMobile,
  activeMode,
  theme,
}) => {
  return (
    <AnimatePresence>
      {showForm && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="announcements-list-drawer bg-white border-start shadow-lg"
          style={{
            position: 'fixed',
            top: activeMode === 'anuncios' ? '140px' : '40px',
            right: 0,
            bottom: 0,
            width: isMobile ? '100%' : '280px',
            zIndex: 1150,
            overflowY: 'auto',
            borderRadius: '0'
          }}
        >
          <div className="p-2 px-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white">
            <h6 className="fw-bold mb-0" style={{ fontSize: '0.8rem' }}>MIS ANUNCIOS</h6>
            <button className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setShowForm(false)}></button>
          </div>
          <div className="p-0">
            {announcements.length === 0 ? (
              <div className="text-center text-muted py-4" style={{ fontSize: '0.75rem' }}>No hay anuncios guardados</div>
            ) : (
              <div className="list-group list-group-flush">
                {announcements.map(ann => {
                  const imgUrl = (ann.imageUrl || ann.image_url)
                    ? ((ann.imageUrl || ann.image_url).startsWith('http')
                      ? (ann.imageUrl || ann.image_url)
                      : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${ann.imageUrl || ann.image_url}`)
                    : null;
                  return (
                    <div key={ann.id} className="list-group-item d-flex align-items-center justify-content-between py-2 px-2 border-bottom">
                      <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                        <img
                          src={imgUrl || logoOasis}
                          className="rounded shadow-sm flex-shrink-0"
                          style={{ width: '40px', height: '50px', objectFit: 'cover', border: '1px solid #e9ecef', borderRadius: '4px' }}
                          alt={ann.title}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="fw-semibold text-truncate" style={{ fontSize: '0.7rem' }}>{ann.title || 'Sin título'}</div>
                          <span className="badge" style={{ fontSize: '0.5rem', background: theme.colors.primary, color: 'white' }}>{ann.tag}</span>
                        </div>
                      </div>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', borderRadius: '4px', fontSize: '0.65rem' }}
                          onClick={(e) => { e.stopPropagation(); handleEdit(ann); }}
                          title="Editar anuncio"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', borderRadius: '4px', fontSize: '0.65rem' }}
                          onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }}
                          title="Eliminar anuncio"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementsList;
