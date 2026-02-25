import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { signIn } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn({
                username: formData.username,
                password: formData.password
            });

            // Redirect to Admin Dashboard natively
            navigate('/admin/solicitudes');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
        }}>
            <GlassCard style={{ maxWidth: '400px', width: '100%', padding: theme.spacing(4) }}>
                <div className="text-center mb-4">
                    <h2 style={{ fontFamily: 'ModernAge, sans-serif', color: theme.colors.primary, marginBottom: theme.spacing(1) }}>
                        OASIS Admin
                    </h2>
                    <p className="text-muted small">Acceso restringido a personal autorizado</p>
                </div>

                {error && (
                    <div className="alert alert-danger small p-2 text-center border-0 rounded-3 mb-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Usuario / Email</label>
                        <input
                            type="text"
                            className="form-control rounded-pill px-3 bg-light border-0"
                            placeholder="admin@oasis.com"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">Contraseña</label>
                        <input
                            type="password"
                            className="form-control rounded-pill px-3 bg-light border-0"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-100 rounded-pill py-2 fw-bold text-white shadow-sm"
                        style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                        disabled={loading}
                    >
                        {loading ? 'Verificando...' : 'INICIAR SESIÓN'}
                    </button>

                    <div className="text-center mt-3">
                        <button type="button" className="btn btn-link btn-sm text-decoration-none text-muted" onClick={() => navigate('/')}>
                            Volver al Inicio
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default Login;
