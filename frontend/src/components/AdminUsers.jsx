import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        id: '', name: '', email: '', password: '', role: 'admin'
    });
    const location = useLocation();
    const navigate = useNavigate();

    const glassStyle = {
        background: theme.glass.background,
        backdropFilter: theme.glass.backdropFilter,
        border: theme.glass.border,
        borderRadius: theme.glass.borderRadius,
        boxShadow: theme.glass.boxShadow
    };

    useEffect(() => {
        // Mock fetch for users since endpoint might not exist yet, 
        // or attempt fetch if it does.
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await apiClient.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users, showing mock for UI demo");
            // Fallback for demo
            setUsers([
                { id: 1, name: 'Admin Principal', email: 'admin@oasis.com', role: 'admin' },
                { id: 2, name: 'Moderador', email: 'mod@oasis.com', role: 'editor' }
            ]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await apiClient.put(`/users/${formData.id}`, formData);
            } else {
                await apiClient.post('/users', formData);
            }
            fetchUsers();
            setShowForm(false);
            resetForm();
        } catch (error) {
            alert('Error al guardar usuario: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este usuario?')) return;
        try {
            await apiClient.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleEdit = (user) => {
        setFormData({ ...user, password: '' });
        setShowForm(true);
    };

    const resetForm = () => setFormData({ id: '', name: '', email: '', password: '', role: 'admin' });

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="container py-5 animate__animated animate__fadeIn">
            {/* Admin Navigation removed - handled by Layout */}

            <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm" style={glassStyle}>
                <div>
                    <h3 className="fw-bold mb-0" style={{ fontFamily: theme.fonts.logo, color: theme.colors.primary }}>Gestión de Usuarios</h3>
                    <p className="text-muted small mb-0">Control de Accesos</p>
                </div>
                <button
                    className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-white"
                    style={{ background: theme.colors.primary }}
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`}></i>
                    {showForm ? 'Cerrar' : 'Nuevo Usuario'}
                </button>
            </div>

            {showForm && (
                <div className="mb-4 shadow-lg p-4 border-0 rounded-4 animate__animated animate__fadeInDown" style={{ ...glassStyle, background: 'white' }}>
                    <h5 className="fw-bold mb-4 border-bottom pb-3">{formData.id ? 'Editar' : 'Nuevo'} Usuario</h5>
                    <form onSubmit={handleSubmit} className="row g-4">
                        <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-2">Nombre</label>
                            <input
                                type="text" className="form-control" placeholder="Nombre completo" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-2">Email</label>
                            <input
                                type="email" className="form-control" placeholder="email@oasis.com" required
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-2">Contraseña</label>
                            <input
                                type="password" className="form-control" placeholder={formData.id ? "Dejar en blanco para mantener" : "Contraseña"}
                                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!formData.id}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="small fw-bold text-muted mb-2">Rol</label>
                            <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="admin">Administrador</option>
                                <option value="editor">Editor</option>
                            </select>
                        </div>
                        <div className="col-12 text-end pt-3 border-top">
                            <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold text-white" style={{ background: theme.colors.primary }}>
                                GUARDAR USUARIO
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card border-0 shadow-sm" style={glassStyle}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                        <thead className="bg-light">
                            <tr className="small text-uppercase">
                                <th className="ps-4 py-3">Usuario</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th className="text-end pe-4">Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="ps-4 py-3 fw-bold">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                <i className="bi bi-person text-primary"></i>
                                            </div>
                                            {u.name}
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><span className="badge bg-light text-primary border">{u.role}</span></td>
                                    <td className="text-end pe-4">
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary border-0" onClick={() => handleEdit(u)}><i className="bi bi-pencil-square"></i></button>
                                            <button className="btn btn-outline-danger border-0" onClick={() => handleDelete(u.id)}><i className="bi bi-trash3"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
