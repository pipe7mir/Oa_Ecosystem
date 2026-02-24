import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

/* ─────────────────────────────────────────────────────────────
   SectionCard MUST be defined OUTSIDE the parent component.
   If defined inside, React treats it as a NEW component type
   on every render → DOM nodes destroyed → inputs lose focus.
───────────────────────────────────────────────────────────── */
const SectionCard = ({ icon, title, badge, children }) => (
    <div className="mb-4 p-4 rounded-4" style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <h6 className="fw-bold mb-0" style={{ color: theme.colors.primary }}>
                <i className={`bi ${icon} me-2`}></i>{title}
            </h6>
            {badge}
        </div>
        {children}
    </div>
);

/* ── SMTP Provider Presets ───────────────────────────────── */
const SMTP_PRESETS = {
    gmail: {
        label: 'Gmail',
        icon: '📧',
        color: '#EA4335',
        host: 'smtp.gmail.com',
        port: '587',
        encryption: 'tls',
        hint: 'Usá una "Contraseña de Aplicación" (no tu contraseña normal). Ve a tu cuenta Google → Seguridad → Contraseñas de aplicación.',
        link: 'https://myaccount.google.com/apppasswords',
        linkLabel: 'Crear contraseña de aplicación',
    },
    outlook: {
        label: 'Outlook / Hotmail',
        icon: '📨',
        color: '#0078D4',
        host: 'smtp-mail.outlook.com',
        port: '587',
        encryption: 'tls',
        hint: 'Usá tu correo y contraseña de Microsoft normales. Asegúrate de que la cuenta tenga SMTP habilitado.',
        link: 'https://account.microsoft.com/security',
        linkLabel: 'Configurar seguridad de cuenta',
    },
    custom: {
        label: 'Servidor personalizado',
        icon: '🔧',
        color: '#6b7280',
        host: '',
        port: '587',
        encryption: 'tls',
        hint: 'Ingresa los datos de tu servidor SMTP propio.',
        link: null,
        linkLabel: null,
    },
};



/* ══════════════════════════════════════════════════════════
   AdminAjustes — Settings Panel
══════════════════════════════════════════════════════════ */
const DEFAULTS = {
    church_name: 'Iglesia Adventista Oasis',
    notify_email: '',
    whatsapp_number: '',
    whatsapp_group_link: '',
    mail_provider: 'gmail',
    mail_host: 'smtp.gmail.com',
    mail_port: '587',
    mail_encryption: 'tls',
    mail_username: '',
    mail_password: '',
    mail_from_name: 'Oasis Iglesia',
    mail_from_address: '',
    // Evolution API
    evolution_url: '',
    evolution_key: '',
    evolution_instance: 'oasis-iglesia',
    // Streaming
    youtube_channel_id: '',
    youtube_live_video_id: '',
    stream_is_live: false,
    youtube_playlist_id: '',
};

const AdminAjustes = () => {
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [waPreview, setWaPreview] = useState(false);
    // Evolution API state
    const [waStatus, setWaStatus] = useState(null);   // { live_state, kill_switch, kill_reason, has_qr, qr_base64 }
    const [waLoading, setWaLoading] = useState(false);  // 'creating'|'connecting'|'logout'|'test'|'kill'
    const [waTestNum, setWaTestNum] = useState('');
    const [waTestMsg, setWaTestMsg] = useState('Hola, este es un mensaje de prueba desde Oasis 📳');
    const [waTestRes, setWaTestRes] = useState(null);
    const [showEvKey, setShowEvKey] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient.get('/settings');
                setSettings(prev => ({ ...prev, ...res.data }));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    /* Use useCallback so `set` reference is stable */
    const set = useCallback((key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    }, []);

    /* Provider preset selector */
    const applyPreset = useCallback((providerKey) => {
        const preset = SMTP_PRESETS[providerKey];
        if (!preset) return;
        setSettings(prev => ({
            ...prev,
            mail_provider: providerKey,
            mail_host: preset.host || prev.mail_host,
            mail_port: preset.port,
            mail_encryption: preset.encryption,
        }));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);
        try {
            await apiClient.post('/settings', settings);
            setFeedback({ type: 'success', msg: '✅ Configuración guardada correctamente' });
        } catch (err) {
            setFeedback({ type: 'error', msg: '❌ ' + (err.response?.data?.message || 'Error al guardar') });
        } finally { setSaving(false); }
    };

    const handleTestEmail = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await apiClient.post('/settings/test-email', { test_to: settings.notify_email });
            setTestResult({ ok: true, msg: res.data.message });
        } catch (err) {
            setTestResult({ ok: false, msg: err.response?.data?.message || 'Error al enviar correo de prueba' });
        } finally { setTesting(false); }
    };

    /* ── Evolution API handlers ───────────────────────── */
    const fetchWaStatus = useCallback(async () => {
        try {
            const res = await apiClient.get('/whatsapp/status');
            setWaStatus(res.data);
        } catch (e) { console.error('WA status error', e); }
    }, []);

    useEffect(() => { fetchWaStatus(); }, [fetchWaStatus]);

    const handleCreateInstance = async () => {
        setWaLoading('creating');
        try {
            // Save settings first so service picks up the new URL/key
            await apiClient.post('/settings', settings);
            const res = await apiClient.post('/whatsapp/create-instance');
            await fetchWaStatus();
            alert(res.data.success ? '✅ Instancia creada. Escanea el QR.' : '❌ ' + res.data.message);
        } catch (e) { alert('❌ ' + (e.response?.data?.message || e.message)); }
        finally { setWaLoading(null); }
    };

    const handleWaLogout = async () => {
        if (!window.confirm('¿Desconectar el número de WhatsApp?')) return;
        setWaLoading('logout');
        try {
            await apiClient.post('/whatsapp/logout');
            await fetchWaStatus();
        } catch (e) { alert('❌ Error al desconectar'); }
        finally { setWaLoading(null); }
    };

    const handleResetKillSwitch = async () => {
        setWaLoading('kill');
        try {
            await apiClient.post('/whatsapp/reset-kill-switch');
            await fetchWaStatus();
        } catch (e) { alert('❌ Error'); }
        finally { setWaLoading(null); }
    };

    const handleWaTest = async () => {
        setWaLoading('test'); setWaTestRes(null);
        try {
            const res = await apiClient.post('/whatsapp/send-test', { to: waTestNum, message: waTestMsg });
            setWaTestRes({ ok: true, msg: 'Mensaje enviado ✅' });
        } catch (e) { setWaTestRes({ ok: false, msg: e.response?.data?.message || 'Error al enviar' }); }
        finally { setWaLoading(null); }
    };

    const previewLink = settings.whatsapp_number
        ? `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(`📋 Mensaje de ${settings.church_name || 'la iglesia'}`)}`
        : settings.whatsapp_group_link || '';

    const preset = SMTP_PRESETS[settings.mail_provider] || SMTP_PRESETS.custom;

    /* ── Render ───────────────────────────────────────────── */
    return (
        <section className="container-fluid pb-5">
            {/* AdminNav removed - handled by Layout */}

            <div className="container" style={{ maxWidth: '820px' }}>

                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div style={{ width: 52, height: 52, background: theme.colors.primary + '15', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-gear-fill fs-3" style={{ color: theme.colors.primary }}></i>
                    </div>
                    <div>
                        <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.logo, color: theme.colors.primary }}>
                            Ajustes del Sistema
                        </h3>
                        <p className="text-muted small mb-0">Email, WhatsApp y datos de la iglesia</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border" style={{ color: theme.colors.primary }}></div>
                    </div>
                ) : (
                    <form onSubmit={handleSave}>

                        {/* ── 1. Iglesia ───────────────────────────────── */}
                        <SectionCard icon="bi-house-heart" title="Información de la Iglesia">
                            <div>
                                <label className="form-label small fw-bold text-muted">Nombre de la Iglesia</label>
                                <input className="form-control form-control-lg"
                                    value={settings.church_name}
                                    onChange={e => set('church_name', e.target.value)}
                                    placeholder="Ej: Iglesia Adventista Oasis" />
                                <div className="form-text">Se usa como remitente en emails y en el encabezado de los mensajes de WhatsApp.</div>
                            </div>
                        </SectionCard>

                        {/* ── 2. WhatsApp ──────────────────────────────── */}
                        <SectionCard icon="bi-whatsapp" title="WhatsApp"
                            badge={<span className="badge rounded-pill fw-normal" style={{ background: '#dcfce7', color: '#16a34a' }}>Sin costo extra</span>}>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">
                                        <i className="bi bi-telephone me-1"></i>Número personal (recomendado)
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text fw-bold">+</span>
                                        <input className="form-control"
                                            value={settings.whatsapp_number}
                                            onChange={e => set('whatsapp_number', e.target.value.replace(/\D/g, ''))}
                                            placeholder="573001234567" />
                                    </div>
                                    <div className="form-text">Código de país + número. Ej: 573001234567 (Colombia)</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">
                                        <i className="bi bi-people me-1"></i>Enlace de grupo (alternativo)
                                    </label>
                                    <input className="form-control"
                                        value={settings.whatsapp_group_link}
                                        onChange={e => set('whatsapp_group_link', e.target.value)}
                                        placeholder="https://chat.whatsapp.com/..." />
                                    <div className="form-text">Se usa si no hay número personal configurado</div>
                                </div>
                            </div>

                            {previewLink && (
                                <div className="mt-3">
                                    <button type="button" className="btn btn-sm btn-outline-success rounded-pill"
                                        onClick={() => setWaPreview(!waPreview)}>
                                        <i className="bi bi-eye me-1"></i>{waPreview ? 'Ocultar enlace' : 'Ver enlace generado'}
                                    </button>
                                    {waPreview && (
                                        <div className="mt-2 p-3 rounded-3 small" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', wordBreak: 'break-all' }}>
                                            <strong>Link generado: </strong>
                                            <a href={previewLink} target="_blank" rel="noopener noreferrer" className="text-success">{previewLink}</a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="alert border-0 rounded-3 mt-3 py-2 px-3 small" style={{ background: '#f0fdf4', color: '#166534' }}>
                                <i className="bi bi-check-circle-fill me-1"></i>
                                <strong>Sin API de pago:</strong> El sistema genera un enlace wa.me con el texto de la solicitud prellenado. El admin solo hace clic y manda el mensaje desde su WhatsApp normal.
                            </div>
                        </SectionCard>

                        {/* ── 3. Email destino ─────────────────────────── */}
                        <SectionCard icon="bi-envelope-fill" title="Correo de Notificaciones">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">
                                        Correo destino de notificaciones
                                    </label>
                                    <input type="email" className="form-control"
                                        value={settings.notify_email}
                                        onChange={e => set('notify_email', e.target.value)}
                                        placeholder="pastor@iglesia.com" />
                                    <div className="form-text">A este correo llegan las solicitudes cuando usás "Enviar por Email"</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">
                                        Nombre del remitente (quien aparece al recibir)
                                    </label>
                                    <input className="form-control"
                                        value={settings.mail_from_name}
                                        onChange={e => set('mail_from_name', e.target.value)}
                                        placeholder="Oasis Iglesia" />
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── 4. SMTP Config ───────────────────────────── */}
                        <SectionCard icon="bi-send-fill" title="Configuración del Servidor de Correo (SMTP)"
                            badge={<span className="badge rounded-pill fw-normal" style={{ background: '#fef3c7', color: '#92400e' }}>Necesario para enviar emails</span>}>

                            {/* Provider selector */}
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted mb-2">Proveedor de correo</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {Object.entries(SMTP_PRESETS).map(([key, p]) => (
                                        <button key={key} type="button"
                                            className="btn fw-semibold px-3 py-2"
                                            style={{
                                                borderRadius: '12px',
                                                border: `2px solid ${settings.mail_provider === key ? p.color : '#e0e0e0'}`,
                                                background: settings.mail_provider === key ? p.color + '15' : 'white',
                                                color: settings.mail_provider === key ? p.color : '#555',
                                                transition: 'all 0.2s',
                                            }}
                                            onClick={() => applyPreset(key)}>
                                            {p.icon} {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hint for selected provider */}
                            {preset.hint && (
                                <div className="alert border-0 rounded-3 py-2 px-3 small mb-4"
                                    style={{ background: preset.color + '12', color: '#333' }}>
                                    <i className="bi bi-lightbulb-fill me-1" style={{ color: preset.color }}></i>
                                    {preset.hint}
                                    {preset.link && (
                                        <> → <a href={preset.link} target="_blank" rel="noopener noreferrer" style={{ color: preset.color }} className="fw-bold">
                                            {preset.linkLabel}
                                        </a></>
                                    )}
                                </div>
                            )}

                            <div className="row g-3">
                                {/* SMTP credentials */}
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-muted">
                                        {settings.mail_provider === 'gmail' ? 'Tu correo Gmail' : settings.mail_provider === 'outlook' ? 'Tu correo de Outlook/Hotmail' : 'Usuario SMTP'}
                                    </label>
                                    <input type="email" className="form-control"
                                        value={settings.mail_username}
                                        onChange={e => set('mail_username', e.target.value)}
                                        placeholder={settings.mail_provider === 'gmail' ? 'tucorreo@gmail.com' : 'tucorreo@outlook.com'} />
                                    {!settings.mail_from_address && settings.mail_username && (
                                        <div className="form-text text-warning">
                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                            El correo "De:" también se completará con este valor
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted">
                                        {settings.mail_provider === 'gmail' ? 'Contraseña de aplicación' : 'Contraseña'}
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="form-control"
                                            value={settings.mail_password}
                                            onChange={e => set('mail_password', e.target.value)}
                                            placeholder={settings.mail_provider === 'gmail' ? 'xxxx xxxx xxxx xxxx' : '••••••••'} />
                                        <button type="button" className="btn btn-outline-secondary"
                                            onClick={() => setShowPass(!showPass)}>
                                            <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* SMTP server */}
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">
                                        Servidor SMTP (Host)
                                    </label>
                                    <input className="form-control"
                                        value={settings.mail_host}
                                        onChange={e => set('mail_host', e.target.value)}
                                        placeholder="smtp.gmail.com" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted">Puerto</label>
                                    <select className="form-select"
                                        value={settings.mail_port}
                                        onChange={e => set('mail_port', e.target.value)}>
                                        <option value="587">587 (TLS — recomendado)</option>
                                        <option value="465">465 (SSL)</option>
                                        <option value="25">25 (Sin cifrado)</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted">Cifrado</label>
                                    <select className="form-select"
                                        value={settings.mail_encryption}
                                        onChange={e => set('mail_encryption', e.target.value)}>
                                        <option value="tls">TLS</option>
                                        <option value="ssl">SSL</option>
                                        <option value="">Ninguno</option>
                                    </select>
                                </div>
                            </div>

                            {/* Test email button */}
                            <div className="mt-4 pt-3 border-top">
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <button type="button" className="btn fw-bold rounded-pill px-4"
                                        style={{ background: '#f0f4ff', color: theme.colors.primary, border: `2px solid ${theme.colors.primary}40` }}
                                        disabled={testing || !settings.notify_email || !settings.mail_username}
                                        onClick={handleTestEmail}>
                                        {testing
                                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando prueba...</>
                                            : <><i className="bi bi-send me-2"></i>Enviar correo de prueba</>
                                        }
                                    </button>
                                    <span className="small text-muted">
                                        Se enviará a <strong>{settings.notify_email || '(configura el correo destino)'}</strong>
                                    </span>
                                </div>
                                {testResult && (
                                    <div className={`alert border-0 rounded-3 mt-2 py-2 px-3 small ${testResult.ok ? 'alert-success' : 'alert-danger'}`}>
                                        {testResult.ok ? '✅' : '❌'} {testResult.msg}
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* ── 5. Evolution API (WhatsApp Automático) ──────── */}
                        <SectionCard icon="bi-robot" title="WhatsApp Automático (Evolution API)"
                            badge={<span className="badge rounded-pill fw-normal" style={{ background: '#ede9fe', color: '#7c3aed' }}>Avanzado</span>}>

                            {/* Kill-switch warning */}
                            {waStatus?.kill_switch && (
                                <div className="alert border-0 rounded-3 mb-3 py-2 px-3" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                    <strong>🚫 Kill-switch ACTIVO</strong> — {waStatus.kill_reason}
                                    <button type="button" className="btn btn-sm btn-danger ms-3 rounded-pill"
                                        disabled={waLoading === 'kill'} onClick={handleResetKillSwitch}>
                                        {waLoading === 'kill' ? 'Resetando...' : 'Reactivar envíos'}
                                    </button>
                                </div>
                            )}

                            {/* Connection status */}
                            {waStatus && (
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div style={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: waStatus.live_state === 'open' ? '#22c55e'
                                            : waStatus.live_state === 'connecting' ? '#f59e0b' : '#ef4444',
                                    }}></div>
                                    <span className="small fw-bold">
                                        {waStatus.live_state === 'open' ? '✅ Conectado'
                                            : waStatus.live_state === 'connecting' ? '⏳ Conectando...'
                                                : waStatus.live_state === 'api_unreachable' ? '⚠️ API no disponible'
                                                    : '🔴 Desconectado'}
                                    </span>
                                    <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill ms-auto"
                                        onClick={fetchWaStatus}>
                                        <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
                                    </button>
                                </div>
                            )}

                            {/* QR Code */}
                            {waStatus?.has_qr && waStatus?.qr_base64 && (
                                <div className="text-center mb-3">
                                    <p className="small text-muted mb-2">Escanea este código con la app de WhatsApp</p>
                                    <img src={waStatus.qr_base64} alt="QR WhatsApp"
                                        style={{ width: 200, height: 200, borderRadius: 12, border: '3px solid #e0e7ff' }} />
                                </div>
                            )}

                            {/* API credentials */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-7">
                                    <label className="form-label small fw-bold text-muted">URL de Evolution API</label>
                                    <input className="form-control"
                                        value={settings.evolution_url}
                                        onChange={e => set('evolution_url', e.target.value)}
                                        placeholder="http://localhost:8080" />
                                    <div className="form-text">URL donde está corriendo tu servidor de Evolution API.</div>
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label small fw-bold text-muted">Nombre de Instancia</label>
                                    <input className="form-control"
                                        value={settings.evolution_instance}
                                        onChange={e => set('evolution_instance', e.target.value)}
                                        placeholder="oasis-iglesia" />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">API Key</label>
                                    <div className="input-group">
                                        <input type={showEvKey ? 'text' : 'password'} className="form-control"
                                            value={settings.evolution_key}
                                            onChange={e => set('evolution_key', e.target.value)}
                                            placeholder="tu-api-key-secreta" />
                                        <button type="button" className="btn btn-outline-secondary"
                                            onClick={() => setShowEvKey(!showEvKey)}>
                                            <i className={`bi ${showEvKey ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="d-flex gap-2 flex-wrap mb-3 pt-2 border-top">
                                <button type="button" className="btn fw-bold rounded-pill px-4"
                                    style={{ background: '#ede9fe', color: '#7c3aed', border: '2px solid #c4b5fd' }}
                                    disabled={waLoading === 'creating'}
                                    onClick={handleCreateInstance}>
                                    {waLoading === 'creating'
                                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Creando...</>
                                        : <><i className="bi bi-plus-circle me-2"></i>Crear / Reconectar Instancia</>}
                                </button>
                                {waStatus?.live_state === 'open' && (
                                    <button type="button" className="btn btn-outline-danger rounded-pill"
                                        disabled={waLoading === 'logout'}
                                        onClick={handleWaLogout}>
                                        <i className="bi bi-power me-1"></i>Desconectar
                                    </button>
                                )}
                            </div>

                            {/* Test Message */}
                            {waStatus?.live_state === 'open' && !waStatus?.kill_switch && (
                                <div className="p-3 rounded-3 border" style={{ background: '#f9fafb' }}>
                                    <div className="small fw-bold text-muted mb-2">🧪 Enviar mensaje de prueba</div>
                                    <div className="row g-2">
                                        <div className="col-md-4">
                                            <input className="form-control form-control-sm"
                                                value={waTestNum}
                                                onChange={e => setWaTestNum(e.target.value)}
                                                placeholder="573001234567" />
                                        </div>
                                        <div className="col-md-6">
                                            <input className="form-control form-control-sm"
                                                value={waTestMsg}
                                                onChange={e => setWaTestMsg(e.target.value)} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-success btn-sm w-100"
                                                disabled={waLoading === 'test' || !waTestNum}
                                                onClick={handleWaTest}>
                                                {waLoading === 'test' ? '...' : 'Enviar'}
                                            </button>
                                        </div>
                                    </div>
                                    {waTestRes && (
                                        <div className={`small mt-2 ${waTestRes.ok ? 'text-success' : 'text-danger'}`}>
                                            {waTestRes.msg}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="alert border-0 rounded-3 mt-3 py-2 px-3 small" style={{ background: '#faf5ff', color: '#6b21a8' }}>
                                <i className="bi bi-shield-check me-1"></i>
                                <strong>Anti-baneo activo:</strong> Cada mensaje usa un delay aleatorio (15-45s) + estado "Escribiendo..." antes de enviar. El webhook detecta baneos automáticamente y detiene los envíos.
                            </div>
                        </SectionCard>

                        {/* Feedback */}
                        {feedback && (
                            <div className={`alert border-0 rounded-3 mb-3 ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                {feedback.msg}
                            </div>
                        )}

                        {/* Save */}
                        <div className="d-grid">
                            <button type="submit" disabled={saving}
                                className="btn btn-lg fw-bold text-white rounded-pill py-3"
                                style={{
                                    background: saving ? '#aaa' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                    boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
                                }}>
                                {saving
                                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                                    : <><i className="bi bi-floppy2-fill me-2"></i>GUARDAR CONFIGURACIÓN</>
                                }
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default AdminAjustes;
