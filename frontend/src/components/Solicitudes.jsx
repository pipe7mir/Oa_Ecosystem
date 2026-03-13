import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import GlassCard from '../react-ui/components/GlassCard';

/* ── Status config ─────────────────────────────────── */
const STATUS_CONFIG = {
    pendiente: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7', icon: 'bi-clock-history' },
    gestionada: { label: 'Gestionada', color: '#10b981', bg: '#d1fae5', icon: 'bi-check-circle-fill' },
    sin_respuesta: { label: 'Sin Respuesta', color: '#ef4444', bg: '#fee2e2', icon: 'bi-x-circle-fill' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
    return (
        <span style={{
            background: cfg.bg, color: cfg.color, fontWeight: '700',
            padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem',
            letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '5px',
        }}>
            <i className={`bi ${cfg.icon}`}></i>{cfg.label}
        </span>
    );
};

/* ── Category colors ───────────────────────────────── */
const CAT_COLORS = {
    'Oración': '#8b5cf6', 'Consejería': '#3b82f6', 'Visita': '#06b6d4',
    'Bautismo': '#10b981', 'Información': '#f59e0b', 'Otro': '#6b7280',
};

/* ── Notification sent badges ──────────────────────── */
const NotifBadges = ({ req }) => (
    <div className="d-flex flex-column gap-1">
        {req.email_sent_at ? (
            <span title={`Email auto-enviado el ${new Date(req.email_sent_at).toLocaleString('es-ES')}`}
                style={{ fontSize: '0.68rem', fontWeight: '600', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                ✉️ Email enviado
            </span>
        ) : req.email_error ? (
            <span title={`Error: ${req.email_error}`}
                style={{ fontSize: '0.68rem', fontWeight: '600', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                ⚠️ Email falló
            </span>
        ) : (
            <span style={{ fontSize: '0.68rem', fontWeight: '600', background: '#f3f4f6', color: '#9ca3af', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                ✉️ Sin enviar
            </span>
        )}
        {req.wa_link_opened_at ? (
            <span title={`WhatsApp el ${new Date(req.wa_link_opened_at).toLocaleString('es-ES')}`}
                style={{ fontSize: '0.68rem', fontWeight: '600', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                📱 WA enviado
            </span>
        ) : (
            <span style={{ fontSize: '0.68rem', fontWeight: '600', background: '#f3f4f6', color: '#9ca3af', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                📱 WA pendiente
            </span>
        )}
    </div>
);



/* ══════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════ */
const Solicitudes = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('todas');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');
    const [actionStatus, setActionStatus] = useState('');  // feedback message
    const [actionLoading, setActionLoading] = useState(null); // 'email'|'whatsapp'|'status'
    const [waModal, setWaModal] = useState(null); // { link, message, has_number }

    const { theme } = useTheme();
    const { showToast } = useToast();
    const isDark = theme.mode === 'dark';
    const glass = { background: theme.glass.background, backdropFilter: theme.glass.backdropFilter, border: theme.glass.border, borderRadius: theme.glass.borderRadius, boxShadow: theme.glass.boxShadow };

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/requests');
            setRequests(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    /* ── Status change ─────────────────────────────── */
    const handleStatusChange = async (id, newStatus) => {
        setActionLoading('status');
        try {
            await apiClient.patch(`/requests/${id}/status`, { status: newStatus, notes });
            setSelected(prev => prev ? { ...prev, status: newStatus, notes } : prev);
            setActionStatus(`✅ Estado actualizado a "${STATUS_CONFIG[newStatus]?.label}"`);
            await fetchRequests();
        } catch (e) {
            setActionStatus('❌ Error al cambiar estado');
        } finally { setActionLoading(null); }
    };

    /* ── Send Email ────────────────────────────────── */
    const handleSendEmail = async () => {
        if (!selected) return;
        // setActionLoading('email');
        // try {
        //     const res = await apiClient.post(`/requests/${selected.id}/send-email`, { notes });
        //     setActionStatus(`✅ ${res.data.message}`);
        // } catch (e) {
        //     const msg = e.response?.data?.message || 'Error al enviar correo';
        //     setActionStatus(`❌ ${msg}`);
        // } finally { setActionLoading(null); }
        showToast('El envío de email requiere un servicio backend (Edge Functions). Se recomienda usar WhatsApp.', 'info');
    };

    /* ── WhatsApp link ─────────────────────────────── */
    const handleWhatsApp = async () => {
        if (!selected) return;
        setActionLoading('whatsapp');
        try {
            const message = `Hola ${selected.name || ''}, soy de OASIS. Respecto a tu solicitud en la categoría ${selected.category}: ${notes}`;
            const link = `https://wa.me/${selected.phone}?text=${encodeURIComponent(message)}`;
            setWaModal({ link, message, has_number: !!selected.phone });

            await apiClient.patch(`/requests/${selected.id}/status`, { status: selected.status, notes });
            await fetchRequests();
        } catch (e) {
            setActionStatus(`❌ Error al generar enlace`);
        } finally { setActionLoading(null); }
    };

    /* ── Open detail modal ─────────────────────────── */
    const openDetail = (req) => {
        setSelected(req);
        setNotes(req.notes || req.response || '');
        setActionStatus('');
    };

    /* ── Filters & stats ───────────────────────────── */
    const filtered = requests.filter(r => filter === 'todas' || r.status === filter);
    const stats = {
        total: requests.length,
        pendiente: requests.filter(r => r.status === 'pendiente').length,
        gestionada: requests.filter(r => r.status === 'gestionada').length,
        sin_respuesta: requests.filter(r => r.status === 'sin_respuesta').length,
    };

    /* ── Render ────────────────────────────────────── */
    return (
        <section className="container-fluid py-5">
            {/* AdminNav removed - handled by Layout */}

            {/* Header + Filter bar */}
            <div className="mb-4 p-4 rounded-4 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3" 
                style={{ 
                    background: theme.glass.background,
                    backdropFilter: theme.glass.backdropFilter,
                    border: theme.glass.border,
                    borderRadius: theme.glass.borderRadius,
                    boxShadow: theme.glass.boxShadow
                }}>
                <div>
                    <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.accent, color: theme.colors.text.primary, fontSize: '2.2rem', textTransform: 'uppercase' }}>
                        Gestión de <span style={{ color: theme.colors.primary }}>Peticiones</span>
                    </h3>
                    <p className="text-muted small mb-0">Peticiones y consultas de la comunidad</p>
                </div>
                    <div className="d-flex gap-2 flex-wrap">
                        {[['todas', 'Todas', null], ['pendiente', 'Pendientes', '#f59e0b'], ['gestionada', 'Gestionadas', '#10b981'], ['sin_respuesta', 'Sin Respuesta', '#ef4444']].map(([key, label, color]) => (
                            <button key={key}
                                onClick={() => setFilter(key)}
                                className="btn btn-sm rounded-pill fw-bold"
                                style={{
                                    background: filter === key ? (color || theme.colors.primary) : (isDark ? 'rgba(255,255,255,0.05)' : 'white'),
                                    color: filter === key ? 'white' : (isDark ? '#eee' : '#666'),
                                    border: `2px solid ${filter === key ? (color || theme.colors.primary) : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0')}`,
                                    transition: 'all 0.2s',
                                }}>
                                {label}
                                <span className="ms-1 badge rounded-pill" style={{ background: filter === key ? 'rgba(255,255,255,0.3)' : '#eee', color: filter === key ? 'white' : '#666', fontSize: '0.7rem' }}>
                                    {key === 'todas' ? stats.total : stats[key]}
                                </span>
                            </button>
                        ))}
                    </div>
            </div>

                    {/* Stats cards */}
                    <div className="container mb-5">
                        <div className="row g-4">
                            {[
                                { label: 'Total', value: stats.total, icon: 'bi-collection', color: theme.colors.primary },
                                { label: 'Pendientes', value: stats.pendiente, icon: 'bi-clock-history', color: '#f59e0b' },
                                { label: 'Gestionadas', value: stats.gestionada, icon: 'bi-check-circle', color: '#10b981' },
                                { label: 'Sin Respuesta', value: stats.sin_respuesta, icon: 'bi-x-circle', color: '#ef4444' },
                            ].map(s => (
                                <div key={s.label} className="col-6 col-md-3">
                                    <div className="p-4 rounded-4 text-center h-100 shadow-sm" 
                                        style={{ 
                                            background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e9ecef'}`,
                                            borderBottom: `4px solid ${s.color}`,
                                            transition: 'transform 0.3s ease'
                                        }}>
                                        <i className={`bi ${s.icon} fs-2 mb-2 d-block`} style={{ color: s.color }}></i>
                                        <div className="fw-bold" style={{ fontSize: '2.2rem', color: isDark ? '#fff' : '#1a1a1a', lineHeight: 1 }}>{s.value}</div>
                                        <div className="small fw-bold text-uppercase mt-2 opacity-50" style={{ letterSpacing: '1px', color: isDark ? '#fff' : '#1a1a1a' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="container">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden" 
                            style={{ 
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e9ecef'}`,
                                backdropFilter: 'blur(20px)'
                            }}>
                            {loading ? (
                                <div className="text-center p-5"><div className="spinner-border" style={{ color: theme.colors.primary }}></div></div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                                        <thead style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>
                                            <tr className="small text-uppercase fw-bold" style={{ color: isDark ? '#a78bfa' : '#6b7280' }}>
                                                <th className="ps-4 py-3">#</th>
                                        <th>Solicitante</th>
                                        <th>Categoría</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Notificaciones</th>
                                        <th>Fecha</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(req => (
                                        <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(req)}>
                                            <td className="ps-4 py-3 text-muted small fw-bold">#{req.id}</td>
                                            <td>
                                                <div className="fw-semibold">{req.is_anonymous ? '🕵️ Anónimo' : (req.name || '—')}</div>
                                                {!req.is_anonymous && req.phone && <div className="small text-muted"><i className="bi bi-telephone me-1"></i>{req.phone}</div>}
                                            </td>
                                            <td>
                                                <span style={{
                                                    background: (CAT_COLORS[req.category] || '#6b7280') + '20',
                                                    color: CAT_COLORS[req.category] || '#6b7280',
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                                }}>
                                                    {req.category}
                                                </span>
                                            </td>
                                            <td className="text-muted small" style={{ maxWidth: '260px' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                                                    {req.description}
                                                </div>
                                            </td>
                                            <td><StatusBadge status={req.status} /></td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <NotifBadges req={req} />
                                            </td>
                                            <td className="small text-muted">
                                                {req.created_at ? new Date(req.created_at).toLocaleDateString('es-ES') : '—'}
                                            </td>
                                            <td className="text-end pe-4" onClick={e => e.stopPropagation()}>
                                                <div className="d-flex gap-1 justify-content-end">
                                                    {/* Quick WA button — no modal needed */}
                                                    {!req.wa_link_opened_at && (
                                                        <button
                                                            title="Enviar por WhatsApp"
                                                            className="btn btn-sm rounded-circle border-0"
                                                            style={{ background: '#dcfce7', color: '#15803d' }}
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    // REEMPLAZO: Generación local del link de WhatsApp
                                                                    const message = `Hola, soy de OASIS. Respecto a tu solicitud #${req.id}...`;
                                                                    const link = `https://wa.me/${req.phone}?text=${encodeURIComponent(message)}`;
                                                                    await window.open(link, '_blank');
                                                                    try {
                                                                        await apiClient.patch(`/requests/${req.id}/status`, { wa_link_opened_at: new Date().toISOString() });
                                                                    } catch (e) { console.error('Error updating WA log', e) }
                                                                    await fetchRequests();
                                                                } catch (err) {
                                                                    showToast(err.response?.data?.message || 'Error WA', 'error');
                                                                }
                                                            }}>
                                                            <i className="bi bi-whatsapp"></i>
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm rounded-circle border-0"
                                                        title="Ver detalle"
                                                        style={{ background: theme.colors.primary + '15', color: theme.colors.primary }}
                                                        onClick={() => openDetail(req)}>
                                                        <i className="bi bi-eye-fill"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="text-center p-5 fw-bold" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#9ca3af' }}>
                                    <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                                    No hay solicitudes {filter !== 'todas' ? `con estado "${STATUS_CONFIG[filter]?.label}"` : ''}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ───────────────────────────────────── */}
            {selected && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(6px)', zIndex: 9000, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: '16px',
                }} onClick={() => setSelected(null)}>
                    <div style={{
                        background: isDark ? theme.colors.surface : 'white', 
                        borderRadius: '24px', width: '100%', maxWidth: '620px',
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                        color: theme.colors.text.primary
                    }} onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="d-flex justify-content-between align-items-start p-4 pb-2">
                            <div>
                                <h5 className="fw-bold mb-1">Solicitud #{selected.id}</h5>
                                <StatusBadge status={selected.status} />
                            </div>
                            <button className="btn btn-sm btn-light rounded-circle" onClick={() => setSelected(null)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="px-4 pb-4">
                            {/* Info grid */}
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <div className="p-3 rounded-3" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>
                                        <div className="small text-muted mb-1">Solicitante</div>
                                        <div className="fw-bold">{selected.is_anonymous ? '🕵️ Anónimo' : (selected.name || '—')}</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 rounded-3" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>
                                        <div className="small text-muted mb-1">Categoría</div>
                                        <div className="fw-bold">{selected.category}</div>
                                    </div>
                                </div>
                                {!selected.is_anonymous && (selected.phone || selected.email) && (
                                    <div className="col-12">
                                        <div className="p-3 rounded-3" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>
                                            <div className="small text-muted mb-1">Contacto</div>
                                            {selected.phone && <div><i className="bi bi-telephone me-1 text-muted"></i>{selected.phone}</div>}
                                            {selected.email && <div><i className="bi bi-envelope me-1 text-muted"></i>{selected.email}</div>}
                                        </div>
                                    </div>
                                )}
                                <div className="col-12">
                                    <div className="p-3 rounded-3" style={{ background: isDark ? 'rgba(109, 40, 217, 0.1)' : '#f0f4ff' }}>
                                        <div className="small text-muted mb-1">Descripción</div>
                                        <div style={{ lineHeight: 1.6 }}>{selected.description}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-1">
                                    <i className="bi bi-pencil me-1"></i>Notas internas / Respuesta
                                </label>
                                <textarea className="form-control" rows="3"
                                    value={notes} onChange={e => setNotes(e.target.value)}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                                        color: isDark ? '#fff' : '#333',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#ced4da'}`
                                    }}
                                    placeholder="Escribe notas internas o una respuesta para incluir en el mensaje..." />
                            </div>

                            {/* Status changer */}
                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-2 d-block">
                                    <i className="bi bi-flag me-1"></i>Cambiar Estado
                                </label>
                                <div className="d-flex gap-2">
                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                        <button key={key} type="button"
                                            className="btn btn-sm flex-grow-1 fw-bold"
                                            disabled={actionLoading === 'status' || selected.status === key}
                                            style={{
                                                background: selected.status === key ? cfg.color : cfg.bg,
                                                color: selected.status === key ? 'white' : cfg.color,
                                                border: `2px solid ${cfg.color}`,
                                                borderRadius: '10px', transition: 'all 0.2s',
                                            }}
                                            onClick={() => handleStatusChange(selected.id, key)}>
                                            <i className={`bi ${cfg.icon} me-1`}></i>
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action feedback */}
                            {actionStatus && (
                                <div className={`alert py-2 px-3 small mb-3 border-0 rounded-3 ${actionStatus.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
                                    {actionStatus}
                                </div>
                            )}

                            {/* Send buttons */}
                            <div className="d-flex gap-2">
                                <button className="btn flex-grow-1 fw-bold text-white"
                                    style={{ background: '#1d7cf2', borderRadius: '12px' }}
                                    disabled={actionLoading === 'email'}
                                    onClick={handleSendEmail}>
                                    {actionLoading === 'email'
                                        ? <><span className="spinner-border spinner-border-sm me-1"></span>Enviando...</>
                                        : <><i className="bi bi-envelope-fill me-2"></i>Enviar por Email</>
                                    }
                                </button>
                                <button className="btn flex-grow-1 fw-bold text-white"
                                    style={{ background: '#25d366', borderRadius: '12px' }}
                                    disabled={actionLoading === 'whatsapp'}
                                    onClick={handleWhatsApp}>
                                    {actionLoading === 'whatsapp'
                                        ? <><span className="spinner-border spinner-border-sm me-1"></span>Preparando...</>
                                        : <><i className="bi bi-whatsapp me-2"></i>Enviar por WhatsApp</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── WhatsApp Confirmation Modal ─────────────────── */}
            {waModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)', zIndex: 9500, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: '16px',
                }} onClick={() => setWaModal(null)}>
                    <div style={{
                        background: isDark ? theme.colors.surface : 'white', 
                        borderRadius: '20px', width: '100%', maxWidth: '480px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '28px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                        color: theme.colors.text.primary
                    }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <div style={{ width: 44, height: 44, background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-whatsapp text-white fs-4"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">Enviar por WhatsApp</h6>
                                <div className="small text-muted">Mensaje prellenado listo</div>
                            </div>
                        </div>

                        <div className="p-3 rounded-3 mb-3" style={{ 
                            background: isDark ? 'rgba(37, 211, 102, 0.1)' : '#f0fdf4', 
                            border: `1px solid ${isDark ? 'rgba(37, 211, 102, 0.2)' : '#bbf7d0'}`, 
                            fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto',
                            color: isDark ? '#dcfce7' : '#15803d'
                        }}>
                            {waModal.message}
                        </div>

                        {!waModal.has_number && (
                            <div className="alert alert-warning py-2 px-3 small mb-3 border-0">
                                <i className="bi bi-info-circle me-1"></i>
                                Se usará el enlace del grupo. El texto está disponible para copiar arriba.
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button className={`btn ${isDark ? 'btn-dark' : 'btn-light'} flex-grow-1 rounded-pill`} onClick={() => setWaModal(null)}>
                                Cancelar
                            </button>
                            <a href={waModal.link} target="_blank" rel="noopener noreferrer"
                                className="btn flex-grow-1 fw-bold text-white rounded-pill"
                                style={{ background: '#25d366' }}
                                onClick={() => setWaModal(null)}>
                                <i className="bi bi-whatsapp me-2"></i>Abrir WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Solicitudes;
