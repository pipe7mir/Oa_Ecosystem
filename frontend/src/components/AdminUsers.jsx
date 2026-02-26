import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { theme } from '../react-ui/styles/theme';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all'); // all, approved, pending
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
            const { data } = await apiClient.get('/users');
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await apiClient.put(`/users/${formData.id}`, formData);
            } else {
                // Map name to username for backend compatibility
                const registerData = {
                    username: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                };
                await apiClient.post('/register', registerData);
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

    const handleApprove = async (id) => {
        try {
            await apiClient.patch(`/users/${id}/approve`);
            fetchUsers();
        } catch (error) {
            alert('Error al aprobar usuario: ' + error.message);
        }
    };

    const handleDisable = async (id) => {
        if (!window.confirm('¿Inhabilitar este usuario? No podrá acceder al sistema.')) return;
        try {
            await apiClient.patch(`/users/${id}/disable`);
            fetchUsers();
        } catch (error) {
            alert('Error al inhabilitar usuario: ' + error.message);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        const action = currentStatus ? 'inhabilitar' : 'habilitar';
        if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} este usuario?`)) return;
        try {
            await apiClient.patch(`/users/${id}/toggle`);
            fetchUsers();
        } catch (error) {
            alert(`Error al ${action} usuario: ` + error.message);
        }
    };

    // Filtrar usuarios según el estado seleccionado
    const filteredUsers = users.filter(u => {
        if (filter === 'approved') return u.isApproved === true;
        if (filter === 'pending') return u.isApproved === false;
        return true;
    });

    const pendingCount = users.filter(u => !u.isApproved).length;

    const handleEdit = (user) => {
        setFormData({ ...user, password: '' });
        setShowForm(true);
    };

    const resetForm = () => setFormData({ id: '', name: '', email: '', password: '', role: 'admin' });

    const handleLogout = async () => {
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
                <div className="d-flex gap-2 align-items-center">
                    {pendingCount > 0 && (
                        <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                            <i className="bi bi-clock-history me-1"></i>
                            {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                        </span>
                    )}
                    <button
                        className="btn rounded-pill px-4 shadow-sm fw-bold border-0 text-white"
                        style={{ background: theme.colors.primary }}
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                    >
                        <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`}></i>
                        {showForm ? 'Cerrar' : 'Nuevo Usuario'}
                    </button>
                </div>
            </div>

            {/* Filtros de estado */}
            <div className="mb-3 d-flex gap-2">
                <button 
                    className={`btn btn-sm rounded-pill px-3 ${filter === 'all' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                    onClick={() => setFilter('all')}
                    style={filter === 'all' ? { background: theme.colors.primary, borderColor: theme.colors.primary } : {}}
                >
                    Todos ({users.length})
                </button>
                <button 
                    className={`btn btn-sm rounded-pill px-3 ${filter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setFilter('approved')}
                >
                    <i className="bi bi-check-circle me-1"></i>
                    Aprobados ({users.filter(u => u.isApproved).length})
                </button>
                <button 
                    className={`btn btn-sm rounded-pill px-3 ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setFilter('pending')}
                >
                    <i className="bi bi-clock me-1"></i>
                    Pendientes ({pendingCount})
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
                                <th>Estado</th>
                                <th className="text-end pe-4">Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-people display-4 d-block mb-3 opacity-50"></i>
                                        {filter === 'pending' ? 'No hay usuarios pendientes' : 
                                         filter === 'approved' ? 'No hay usuarios aprobados' : 
                                         'No hay usuarios registrados'}
                                    </td>
                                </tr>
                            ) : filteredUsers.map(u => (
                                <tr key={u.id} className={!u.isApproved ? 'table-warning' : ''}>
                                    <td className="ps-4 py-3 fw-bold">
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${u.isApproved ? 'bg-light' : 'bg-warning'}`} style={{ width: '40px', height: '40px' }}>
                                                <i className={`bi ${u.isApproved ? 'bi-person text-primary' : 'bi-person-exclamation text-dark'}`}></i>
                                            </div>
                                            <div>
                                                {u.name || u.username}
                                                {!u.isApproved && <small className="d-block text-warning fw-normal">Requiere aprobación</small>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><span className="badge bg-light text-primary border">{u.role}</span></td>
                                    <td>
                                        <div className="form-check form-switch">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                role="switch"
                                                checked={u.isApproved || false}
                                                onChange={() => handleToggle(u.id, u.isApproved)}
                                                style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                                            />
                                            <label className={`form-check-label small ${u.isApproved ? 'text-success' : 'text-warning'}`}>
                                                {u.isApproved ? 'Activo' : 'Pendiente'}
                                            </label>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="btn-group btn-group-sm">
                                            {!u.isApproved ? (
                                                <button 
                                                    className="btn btn-success btn-sm" 
                                                    onClick={() => handleApprove(u.id)}
                                                    title="Aprobar usuario"
                                                >
                                                    <i className="bi bi-check-lg me-1"></i>Aprobar
                                                </button>
                                            ) : (
                                                <button 
                                                    className="btn btn-outline-warning btn-sm" 
                                                    onClick={() => handleDisable(u.id)}
                                                    title="Inhabilitar usuario"
                                                >
                                                    <i className="bi bi-slash-circle"></i>
                                                </button>
                                            )}
                                            <button className="btn btn-outline-primary border-0" onClick={() => handleEdit(u)} title="Editar"><i className="bi bi-pencil-square"></i></button>
                                            <button className="btn btn-outline-danger border-0" onClick={() => handleDelete(u.id)} title="Eliminar"><i className="bi bi-trash3"></i></button>
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
