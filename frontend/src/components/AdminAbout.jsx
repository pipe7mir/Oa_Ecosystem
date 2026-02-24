import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

const SectionCard = ({ icon, title, children }) => (
    <div className="mb-4 p-4 rounded-4" style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <h6 className="fw-bold mb-0" style={{ color: theme.colors.primary }}>
                <i className={`bi ${icon} me-2`}></i>{title}
            </h6>
        </div>
        {children}
    </div>
);

const DEFAULTS = {
    about_hero_title: 'Nuestra Identidad',
    about_hero_content: 'Somos una comunidad dedicada a transformar vidas a través del amor, el servicio y la innovación. Creemos en construir un futuro donde todos tengan un lugar.',
    about_mission_title: 'Nuestra Misión',
    about_mission_content: 'Llevar el mensaje de esperanza a cada rincón, restaurando vidas y familias a través del amor incondicional y el servicio desinteresado a nuestra comunidad.',
    about_mission_icon: 'bi-heart-pulse-fill',
    about_vision_title: 'Nuestra Visión',
    about_vision_content: 'Ser una iglesia relevante y vibrante que impacta su entorno, formando generaciones que viven con propósito y pasión por la transformación social y espiritual.',
    about_vision_icon: 'bi-eye-fill',
    about_values_title: 'Valores',
    about_values_content: 'Integridad en nuestro caminar, Excelencia en nuestro servicio, Unidad en nuestra diversidad y Amor en todas nuestras acciones como fundamento de todo lo que hacemos.',
    about_values_icon: 'bi-shield-check',
    about_history_title: 'Nuestra Historia',
    about_history_content: 'Fundada in 2020, OASIS nació como una respuesta a la necesidad de conexión in tiempos difíciles. Lo que comenzó como un pequeño grupo in una sala de estar, se ha convertido in un movimiento dinámico que abraza la tecnología y la tradición para crear experiencias significativas.',
    about_history_image: null,
};

const AdminAbout = () => {
    const [settings, setSettings] = useState(DEFAULTS);
    const [boardMembers, setBoardMembers] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]);

    // New Member Form State
    const [memberForm, setMemberForm] = useState({ name: '', role: '', type: 'individual', description: '', image_url: '', fullscreen_image_url: '' });
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [memberFormSaving, setMemberFormSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const fetchData = async () => {
        try {
            const [settingsRes, boardRes, galleryRes] = await Promise.all([
                apiClient.get('/settings'),
                apiClient.get('/board-members'),
                apiClient.get('/gallery-items')
            ]);

            const aboutData = {};
            Object.keys(DEFAULTS).forEach(key => {
                if (settingsRes.data[key] !== undefined) {
                    aboutData[key] = settingsRes.data[key];
                }
            });
            setSettings(prev => ({ ...prev, ...aboutData }));
            setBoardMembers(boardRes.data);
            setGalleryItems(galleryRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const set = useCallback((key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    }, []);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);
        try {
            await apiClient.post('/settings', settings);
            setFeedback({ type: 'success', msg: '✅ Contenido "Quienes Somos" guardado correctamente' });
        } catch (err) {
            setFeedback({ type: 'error', msg: '❌ Error al guardar: ' + (err.response?.data?.message || err.message) });
        } finally {
            setSaving(false);
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.url;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMemberFormSaving(true);
        try {
            // For group members, if name is empty, use the role (department name) as the name
            const submissionData = { ...memberForm };
            if (submissionData.type === 'group' && !submissionData.name) {
                submissionData.name = submissionData.role || 'Departamento';
            }
            await apiClient.post('/board-members', { ...submissionData, order: boardMembers.length });
            setMemberForm({ name: '', role: '', type: 'individual', description: '', image_url: '', fullscreen_image_url: '' });
            setShowMemberForm(false);
            fetchData();
        } catch (err) {
            alert('Error al guardar: ' + (err.response?.data?.message || err.message));
        } finally {
            setMemberFormSaving(false);
        }
    };

    const handleBoardDelete = async (id) => {
        if (!window.confirm('¿Eliminar este miembro?')) return;
        try {
            await apiClient.delete(`/board-members/${id}`);
            fetchData();
        } catch (err) { alert('Error al eliminar'); }
    };

    const handleGallerySave = async (item) => {
        try {
            await apiClient.post('/gallery-items', item);
            fetchData();
        } catch (err) { alert('Error al guardar item de galería'); }
    };

    const handleGalleryDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta imagen de la galería?')) return;
        try {
            await apiClient.delete(`/gallery-items/${id}`);
            fetchData();
        } catch (err) { alert('Error al eliminar'); }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;

        let base = import.meta.env.VITE_API_BASE_URL;
        if (!base && import.meta.env.VITE_API_URL) {
            base = import.meta.env.VITE_API_URL.replace('/api', '');
        }

        if (!base) {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                base = `http://${window.location.hostname}:8000`;
            }
        }

        base = base || '';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${base.replace(/\/$/, '')}${cleanUrl}`;
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <section className="container-fluid pb-5">
            <div className="container" style={{ maxWidth: '850px' }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div style={{ width: 52, height: 52, background: theme.colors.primary + '15', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-info-circle-fill fs-3" style={{ color: theme.colors.primary }}></i>
                    </div>
                    <div>
                        <h3 className="fw-bold mb-0" style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary }}>
                            Gestión Quienes Somos
                        </h3>
                        <p className="text-muted small mb-0">Administra identidad, directiva y galería</p>
                    </div>
                </div>

                <form onSubmit={handleSaveSettings}>
                    <SectionCard icon="bi-megaphone" title="Encabezado (Hero)">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Título Principal</label>
                            <input className="form-control" value={settings.about_hero_title} onChange={e => set('about_hero_title', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label small fw-bold text-muted">Contenido Introductorio</label>
                            <textarea className="form-control" rows="3" value={settings.about_hero_content} onChange={e => set('about_hero_content', e.target.value)}></textarea>
                        </div>
                    </SectionCard>

                    <div className="row">
                        <div className="col-md-4">
                            <SectionCard icon="bi-heart-pulse" title="Misión">
                                <div className="mb-2">
                                    <label className="form-label x-small fw-bold text-muted">Icono (Bootstrap)</label>
                                    <input className="form-control form-control-sm" value={settings.about_mission_icon} onChange={e => set('about_mission_icon', e.target.value)} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label x-small fw-bold text-muted">Título</label>
                                    <input className="form-control form-control-sm" value={settings.about_mission_title} onChange={e => set('about_mission_title', e.target.value)} />
                                </div>
                                <textarea className="form-control form-control-sm" rows="4" value={settings.about_mission_content} onChange={e => set('about_mission_content', e.target.value)}></textarea>
                            </SectionCard>
                        </div>
                        <div className="col-md-4">
                            <SectionCard icon="bi-eye" title="Visión">
                                <div className="mb-2">
                                    <label className="form-label x-small fw-bold text-muted">Icono (Bootstrap)</label>
                                    <input className="form-control form-control-sm" value={settings.about_vision_icon} onChange={e => set('about_vision_icon', e.target.value)} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label x-small fw-bold text-muted">Título</label>
                                    <input className="form-control form-control-sm" value={settings.about_vision_title} onChange={e => set('about_vision_title', e.target.value)} />
                                </div>
                                <textarea className="form-control form-control-sm" rows="4" value={settings.about_vision_content} onChange={e => set('about_vision_content', e.target.value)}></textarea>
                            </SectionCard>
                        </div>
                        <div className="col-md-4">
                            <SectionCard icon="bi-shield-check" title="Valores">
                                <div className="mb-2">
                                    <label className="form-label x-small fw-bold text-muted">Icono (Bootstrap)</label>
                                    <input className="form-control form-control-sm" value={settings.about_values_icon} onChange={e => set('about_values_icon', e.target.value)} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label x-small fw-bold text-muted">Título</label>
                                    <input className="form-control form-control-sm" value={settings.about_values_title} onChange={e => set('about_values_title', e.target.value)} />
                                </div>
                                <textarea className="form-control form-control-sm" rows="4" value={settings.about_values_content} onChange={e => set('about_values_content', e.target.value)}></textarea>
                            </SectionCard>
                        </div>
                    </div>

                    <SectionCard icon="bi-clock-history" title="Nuestra Historia">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Título</label>
                            <input className="form-control" value={settings.about_history_title} onChange={e => set('about_history_title', e.target.value)} />
                        </div>
                        <div className="row g-3">
                            <div className="col-md-8">
                                <textarea className="form-control" rows="6" value={settings.about_history_content} onChange={e => set('about_history_content', e.target.value)}></textarea>
                            </div>
                            <div className="col-md-4 text-center">
                                <div className="border rounded-4 p-2 bg-light mb-2" style={{ height: '140px', overflow: 'hidden' }}>
                                    {settings.about_history_image ? <img src={getImageUrl(settings.about_history_image)} className="img-fluid rounded-3 h-100 w-100 object-fit-cover" alt="" /> : <i className="bi bi-image fs-1 opacity-25 mt-4 d-block"></i>}
                                </div>
                                <input type="file" className="form-control form-control-sm" onChange={async e => set('about_history_image', await uploadFile(e.target.files[0]))} />
                            </div>
                        </div>
                    </SectionCard>

                    {feedback && <div className={`alert border-0 rounded-3 mb-3 ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>{feedback.msg}</div>}

                    <div className="d-grid mb-5">
                        <button type="submit" disabled={saving} className="btn btn-lg fw-bold text-white rounded-pill py-3"
                            style={{ background: saving ? '#aaa' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, boxShadow: '0 4px 18px rgba(0,0,0,0.18)' }}>
                            {saving ? 'Guardando...' : 'GUARDAR TEXTOS E IDENTIDAD'}
                        </button>
                    </div>
                </form>

                {/* BOARD MEMBERS SECTION */}
                <SectionCard icon="bi-people-fill" title="Miembros de la Directiva">
                    <div className="mb-4">
                        {boardMembers.length > 0 ? (
                            <div className="row g-3">
                                {boardMembers.map(m => (
                                    <div key={m.id} className="col-md-6">
                                        <div className="p-3 border rounded-4 d-flex align-items-center gap-3 bg-white h-100 position-relative shadow-sm hover-shadow">
                                            <div style={{ width: 60, height: 60, borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                                <img src={getImageUrl(m.image_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <div className="d-flex align-items-center gap-2">
                                                    <h6 className="mb-0 fw-bold">{m.type === 'group' ? m.role : m.name}</h6>
                                                    <span className={`badge rounded-pill ${m.type === 'group' ? 'bg-secondary' : 'bg-primary'} x-small`} style={{ fontSize: '0.6rem' }}>
                                                        {m.type === 'group' ? 'Grupo' : 'Persona'}
                                                    </span>
                                                </div>
                                                {m.type !== 'group' && <small className="text-primary fw-600 d-block mb-1">{m.role}</small>}
                                                <p className="small text-muted mb-0 text-truncate" title={m.description}>{m.description || 'Sin descripción'}</p>
                                            </div>
                                            <button className="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-2 rounded-circle" style={{ width: 28, height: 28, padding: 0 }} onClick={() => handleBoardDelete(m.id)}>
                                                <i className="bi bi-trash3-fill"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted border rounded-4 bg-light">Aún no hay miembros registrados</div>
                        )}
                    </div>

                    {!showMemberForm ? (
                        <button className="btn btn-primary btn-sm rounded-pill px-4 py-2" onClick={() => setShowMemberForm(true)}>
                            <i className="bi bi-plus-lg me-2"></i>Añadir Miembro
                        </button>
                    ) : (
                        <div className="p-4 border rounded-4 bg-light animate-in">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">Nuevo Miembro</h6>
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <div className="row g-2">
                                        <div className="col-6 text-center">
                                            <label className="form-label x-small fw-bold text-muted d-block">Miniatura Vertical (4:5)</label>
                                            <div className="border rounded-4 bg-white mb-2 mx-auto" style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', position: 'relative' }}>
                                                {imageUploading === 'miniature' ? (
                                                    <div className="h-100 d-flex align-items-center justify-content-center">
                                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                                    </div>
                                                ) : memberForm.image_url ? (
                                                    <img src={getImageUrl(memberForm.image_url)} className="img-fluid h-100 w-100 object-fit-cover" alt="" />
                                                ) : (
                                                    <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                                                        <i className="bi bi-person-bounding-box fs-3 opacity-25"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <label className="btn btn-xs btn-outline-primary rounded-pill w-100 py-1" style={{ fontSize: '0.7rem' }}>
                                                Subir 4:5
                                                <input type="file" hidden onChange={async e => {
                                                    setImageUploading('miniature');
                                                    try {
                                                        const url = await uploadFile(e.target.files[0]);
                                                        setMemberForm(prev => ({ ...prev, image_url: url }));
                                                    } finally {
                                                        setImageUploading(false);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div className="col-6 text-center">
                                            <label className="form-label x-small fw-bold text-muted d-block">Full HD (1920x1080 | 16:9)</label>
                                            <div className="border rounded-4 bg-white mb-2 mx-auto" style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                                                {imageUploading === 'fullscreen' ? (
                                                    <div className="h-100 d-flex align-items-center justify-content-center">
                                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                                    </div>
                                                ) : memberForm.fullscreen_image_url ? (
                                                    <img
                                                        src={getImageUrl(memberForm.fullscreen_image_url)}
                                                        className="img-fluid h-100 w-100 object-fit-cover"
                                                        alt=""
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = getImageUrl(memberForm.image_url);
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                                                        <i className="bi bi-display fs-3 opacity-25"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <label className="btn btn-xs btn-outline-secondary rounded-pill w-100 py-1" style={{ fontSize: '0.7rem' }}>
                                                Subir 16:9
                                                <input type="file" hidden onChange={async e => {
                                                    setImageUploading('fullscreen');
                                                    try {
                                                        const url = await uploadFile(e.target.files[0]);
                                                        setMemberForm(prev => ({ ...prev, fullscreen_image_url: url }));
                                                    } finally {
                                                        setImageUploading(false);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="row g-2 mb-2">
                                        {memberForm.type !== 'group' && (
                                            <div className="col-md-8">
                                                <label className="form-label small fw-bold text-muted">Nombre</label>
                                                <input className="form-control form-control-sm" placeholder="Nombre completo" value={memberForm.name} onChange={e => setMemberForm(prev => ({ ...prev, name: e.target.value }))} />
                                            </div>
                                        )}
                                        <div className={memberForm.type !== 'group' ? "col-md-4" : "col-12"}>
                                            <label className="form-label small fw-bold text-muted">Representación</label>
                                            <select className="form-select form-select-sm" value={memberForm.type} onChange={e => setMemberForm(prev => ({ ...prev, type: e.target.value }))}>
                                                <option value="individual">Persona</option>
                                                <option value="group">Grupo de Trabajo</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-muted">{memberForm.type === 'group' ? 'Nombre del Departamento' : 'Cargo / Rol'}</label>
                                        <input className="form-control form-control-sm" placeholder={memberForm.type === 'group' ? 'Ej. Comité de Salud, Departamento de Jóvenes...' : 'Ej. Pastor, Secretaría...'} value={memberForm.role} onChange={e => setMemberForm(prev => ({ ...prev, role: e.target.value }))} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Descripción del Cargo</label>
                                        <textarea className="form-control form-control-sm" rows="2" placeholder="Breve descripción..." value={memberForm.description} onChange={e => setMemberForm(prev => ({ ...prev, description: e.target.value }))}></textarea>
                                    </div>
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => setShowMemberForm(false)}>Cancelar</button>
                                        <button className="btn btn-sm btn-primary rounded-pill px-4" onClick={handleFormSubmit} disabled={memberFormSaving || (memberForm.type !== 'group' ? !memberForm.name : !memberForm.role) || imageUploading}>
                                            {memberFormSaving ? 'Guardando...' : 'Guardar Miembro'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* GALLERY SECTION */}
                <SectionCard icon="bi-images" title="Galería Infinite Carousel">
                    <div className="mb-3 p-3 bg-light rounded-4 border border-dashed text-center position-relative">
                        <i className="bi bi-cloud-arrow-up fs-1 d-block opacity-25"></i>
                        <span className="small text-muted d-block mb-2">Sube imágenes por lote para la galería principal</span>
                        <label className="btn btn-primary btn-sm rounded-pill px-4 mb-0">
                            <i className="bi bi-plus-lg me-1"></i> Añadir Fotos
                            <input type="file" hidden multiple onChange={async e => {
                                const files = Array.from(e.target.files);
                                for (const file of files) {
                                    const url = await uploadFile(file);
                                    handleGallerySave({ image_url: url, order: galleryItems.length });
                                }
                            }} />
                        </label>
                    </div>

                    <div className="row g-3 mb-4">
                        {galleryItems.map(item => (
                            <div key={item.id} className="col-md-4">
                                <div className="card h-100 border rounded-4 overflow-hidden position-relative group shadow-sm">
                                    <img src={getImageUrl(item.image_url)} className="card-img-top" style={{ height: '140px', objectFit: 'cover' }} alt="" />
                                    <div className="p-2 bg-white">
                                        <input
                                            className="form-control form-control-sm border-0 bg-light-soft"
                                            placeholder="Título (opcional)"
                                            value={item.title || ''}
                                            onChange={e => {
                                                const updated = [...galleryItems];
                                                const i = updated.findIndex(x => x.id === item.id);
                                                updated[i].title = e.target.value;
                                                setGalleryItems(updated);
                                            }}
                                            onBlur={() => handleGallerySave(item)}
                                        />
                                        <textarea
                                            className="form-control form-control-sm border-0 bg-light-soft mt-1"
                                            rows="2"
                                            placeholder="Descripción..."
                                            value={item.description || ''}
                                            onChange={e => {
                                                const updated = [...galleryItems];
                                                const i = updated.findIndex(x => x.id === item.id);
                                                updated[i].description = e.target.value;
                                                setGalleryItems(updated);
                                            }}
                                            onBlur={() => handleGallerySave(item)}
                                            style={{ fontSize: '0.75rem' }}
                                        ></textarea>
                                    </div>
                                    <button className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 p-1 py-0 rounded-circle" onClick={() => handleGalleryDelete(item.id)}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-muted small mb-0"><i className="bi bi-info-circle me-1"></i>Las imágenes se mostrarán con desplazamiento continuo. Los cambios in textos se guardan automáticamente al salir del campo.</p>
                </SectionCard>
            </div>
            <style>{`
                .x-small { font-size: 0.7rem; }
                .btn-xs { padding: 0.2rem 0.4rem; font-size: 0.75rem; }
                .hover-shadow:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; transform: translateY(-2px); transition: all 0.3s ease; }
                .bg-light-soft { background-color: #f8f9fa; border-radius: 8px; }
                .fw-600 { font-weight: 600; }
                .animate-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </section>
    );
};

export default AdminAbout;
