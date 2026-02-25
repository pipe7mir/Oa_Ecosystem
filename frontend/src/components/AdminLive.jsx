import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

const AdminLive = () => {
    const [settings, setSettings] = useState({
        youtube_channel_id: '',
        youtube_live_video_id: '',
        stream_is_live: false,
        youtube_playlist_id: '',
        bg_image: '',
        overlay_opacity: 0.5,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // UI States
    const [showLibrary, setShowLibrary] = useState(false);
    const [uploading, setUploading] = useState(false);

    const stockImages = [
        "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80",
        "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80",
        "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80",
        "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80",
        "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80",
        "https://images.unsplash.com/photo-1499209974431-2761e25236d0?w=800&q=80",
        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80",
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
    ];

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const formData = new FormData();
            formData.append('file', file, fileName);

            const { data } = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = data.url || data.filename;
            handleChange('bg_image', imageUrl);
        } catch (error) {
            console.error(error);
            alert('Error al subir imagen: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/settings');
            const settingsObj = Array.isArray(data) ?
                data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) :
                data;

            // Only update relevant keys for this module
            const liveKeys = Object.keys(settings);
            const filtered = {};
            liveKeys.forEach(k => {
                if (settingsObj[k] !== undefined) filtered[k] = settingsObj[k];
            });
            setSettings(prev => ({ ...prev, ...filtered }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post('/settings', settings);
            alert('Configuración guardada correctamente');
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const glass = {
        background: theme.glass.background,
        backdropFilter: theme.glass.backdropFilter,
        border: theme.glass.border,
        borderRadius: theme.glass.borderRadius,
        boxShadow: theme.glass.boxShadow
    };

    const isLive = settings.stream_is_live == true || settings.stream_is_live == '1';

    return (
        <div className="container py-4 animate__animated animate__fadeIn">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm" style={glass}>
                <div>
                    <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.logo, color: theme.colors.primary }}>
                        <i className="bi bi-broadcast me-2"></i>Transmisión en Vivo
                    </h3>
                    <p className="text-muted small mb-0">Control de directos y YouTube</p>
                </div>
                <button
                    className="btn rounded-pill px-4 shadow-sm fw-bold text-white"
                    style={{ background: theme.colors.primary }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar Cambios</>}
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-8 mx-auto">
                    <div className="p-4 rounded-4 bg-white shadow-sm border">

                        {/* Live Switch */}
                        <div className="d-flex align-items-center justify-content-between mb-4 p-3 rounded-3"
                            style={{ background: isLive ? '#f3f0ff' : '#f8f9fa', border: isLive ? `1px solid ${theme.colors.primary}` : '1px solid #dee2e6' }}>
                            <div>
                                <h5 className="fw-bold mb-1">Estado de la Transmisión</h5>
                                <div className="text-muted small">Activa esto para mostrar el reproductor en el Home</div>
                            </div>
                            <div className="form-check form-switch custom-switch-lg">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="stream_is_live"
                                    style={{ width: '3.5em', height: '1.75em', cursor: 'pointer' }}
                                    checked={isLive}
                                    onChange={e => handleChange('stream_is_live', e.target.checked)}
                                />
                            </div>
                        </div>

                        {/* IDs */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-muted small">ID del Video en Vivo (YouTube)</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0"><i className="bi bi-youtube text-danger"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Ej: dQw4w9WgXcQ"
                                    value={settings.youtube_live_video_id || ''}
                                    onChange={e => handleChange('youtube_live_video_id', e.target.value)}
                                />
                            </div>
                            <div className="form-text small">
                                El código que aparece después de <code>v=</code> en la URL de YouTube.
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold text-muted small">ID de Lista de Reproducción (Respaldo)</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0"><i className="bi bi-collection-play text-muted"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Ej: PL..."
                                    value={settings.youtube_playlist_id || ''}
                                    onChange={e => handleChange('youtube_playlist_id', e.target.value)}
                                />
                            </div>
                            <div className="form-text small">
                                Se mostrará cuando no haya transmisión en vivo.
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold text-muted small">ID del Canal</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Channel ID"
                                value={settings.youtube_channel_id || ''}
                                onChange={e => handleChange('youtube_channel_id', e.target.value)}
                            />
                        </div>

                    </div>

                    {/* ── Visual Customization ── */}
                    <div className="p-4 rounded-4 bg-white shadow-sm border mt-4">
                        <h5 className="fw-bold mb-4" style={{ color: theme.colors.primary }}>
                            <i className="bi bi-palette me-2"></i>Personalización Visual
                        </h5>

                        <div className="row g-4">
                            <div className="col-md-6">
                                {/* Controls */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted small">Imagen de Fondo</label>

                                    <div className="d-flex gap-2 mb-2">
                                        <button
                                            className="btn btn-outline-primary w-100 rounded-3 d-flex align-items-center justify-content-center"
                                            onClick={() => setShowLibrary(true)}
                                        >
                                            <i className="bi bi-images me-2"></i>Biblioteca
                                        </button>
                                        <label className="btn btn-outline-secondary w-100 rounded-3 d-flex align-items-center justify-content-center cursor-pointer mb-0">
                                            {uploading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-upload me-2"></i>}
                                            {uploading ? 'Subiendo...' : 'Subir'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>

                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-link-45deg"></i></span>
                                        <input
                                            type="url"
                                            className="form-control border-start-0"
                                            placeholder="O ingresa una URL..."
                                            value={settings.bg_image || ''}
                                            onChange={e => handleChange('bg_image', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-text small">Imagen que se verá detrás del reproductor.</div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-muted small">
                                        Opacidad del Fondo Negro ({Math.round((settings.overlay_opacity || 0.5) * 100)}%)
                                    </label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0" max="1" step="0.05"
                                        value={settings.overlay_opacity || 0.5}
                                        onChange={e => handleChange('overlay_opacity', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                {/* Preview */}
                                <label className="form-label fw-bold text-muted small mb-2">Vista Previa</label>
                                <div className="rounded-3 overflow-hidden position-relative shadow-lg"
                                    style={{
                                        aspectRatio: '16/9',
                                        backgroundImage: settings.bg_image ? `url(${settings.bg_image})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundColor: '#000'
                                    }}>

                                    {/* Overlay */}
                                    <div className="position-absolute top-0 start-0 w-100 h-100"
                                        style={{ backgroundColor: `rgba(0,0,0,${settings.overlay_opacity || 0.5})` }}></div>

                                    {/* Dummy Player Content */}
                                    <div className="position-absolute top-50 start-50 translate-middle w-75">
                                        <div className="ratio ratio-16x9 bg-black rounded shadow-sm border border-secondary" style={{ opacity: 0.8 }}>
                                            <div className="d-flex align-items-center justify-content-center text-white-50">
                                                <div>
                                                    <i className="bi bi-play-circle fs-1 d-block text-center mb-2"></i>
                                                    <small>Reproductor de Video</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Library Modal */}
            {showLibrary && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowLibrary(false)}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '900px',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-dark">Biblioteca de Imágenes</h4>
                            <button className="btn btn-close" onClick={() => setShowLibrary(false)}></button>
                        </div>
                        <div className="row g-3">
                            {stockImages.map((img, idx) => (
                                <div key={idx} className="col-6 col-md-3">
                                    <div
                                        style={{ height: '180px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '3px solid transparent' }}
                                        className="hover-scale shadow-sm"
                                        onClick={() => { handleChange('bg_image', img); setShowLibrary(false); }}
                                    >
                                        <img src={img} alt="Stock" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <style>{`.hover-scale:hover { transform: scale(1.03); border-color: ${theme.colors.primary} !important; transition: all 0.2s; }`}</style>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminLive;

