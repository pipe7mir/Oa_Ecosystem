import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../react-ui/ThemeContext';
import GlassCard from '../react-ui/components/GlassCard';

const Login = () => {
    const { signIn } = useAuth();
    const { theme } = useTheme(); // solo para spacing y fuentes
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Colores fijos para el LOGIN (Siempre Claro/Refinado)
    const loginTheme = {
        primary: '#6D28D9',
        secondary: '#8B5CF6',
        surface: '#ffffff',
        text: '#1e1b4b',
        muted: '#6b7280',
        inputBg: '#f8f9fa'
    };

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
            <GlassCard style={{ 
                maxWidth: '430px', 
                width: '100%', 
                padding: theme.spacing(4), 
                borderRadius: '32px',
                background: loginTheme.surface,
                border: '1px solid rgba(109, 40, 217, 0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <div className="text-center mb-5">
                    <h2 style={{ 
                        fontFamily: 'ModernAge, sans-serif', 
                        color: loginTheme.primary, 
                        fontWeight: 900,
                        fontSize: '1.8rem',
                        letterSpacing: '1px',
                        marginBottom: theme.spacing(1) 
                    }}>
                        OASIS ADMIN
                    </h2>
                    <p style={{ color: loginTheme.muted, fontSize: '0.85rem', fontWeight: 600 }}>
                        Acceso restringido a personal autorizado
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger small p-2 text-center border-0 rounded-3 mb-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label x-small fw-900 text-uppercase tracking-widest" style={{ color: loginTheme.primary, opacity: 0.8 }}>Usuario / Email</label>
                        <input
                            type="text"
                            className="form-control rounded-pill px-4 py-3 border-0"
                            style={{ background: loginTheme.inputBg, color: loginTheme.text, fontSize: '0.9rem' }}
                            placeholder="admin@oasis.com"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label x-small fw-900 text-uppercase tracking-widest" style={{ color: loginTheme.primary, opacity: 0.8 }}>Contraseña</label>
                        <input
                            type="password"
                            className="form-control rounded-pill px-4 py-3 border-0"
                            style={{ background: loginTheme.inputBg, color: loginTheme.text, fontSize: '0.9rem' }}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-100 rounded-pill py-2 fw-bold text-white shadow-sm"
                        style={{ background: `linear-gradient(90deg, ${loginTheme.primary}, ${loginTheme.secondary})` }}
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
