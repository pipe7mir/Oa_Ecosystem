import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ── Layouts ──────────────────────────────────────────
import LayoutMaestro from './components/LayoutMaestro';  // nuevo: sidebar / bottom-nav
import AdminLayout from '../components/AdminLayout';    // admin: sin cambios

// ── Módulos Públicos ──────────────────────────────────
import Home from './modules/Home';
import Live from './modules/Live';
import About from './modules/About';
import Inscripciones from './modules/Inscripciones';
import Peticiones from '../components/Peticiones';
import Recursos from '../components/Recursos';
import Login from '../components/Login';
import PWAGateway from './components/PWAGateway';

// ── Módulos Admin ─────────────────────────────────────
import Dashboard from '../components/Dashboard';
import Solicitudes from '../components/Solicitudes';
import AdminRecursos from '../components/AdminRecursos';
import AdminAnnouncements from '../components/AdminAnnouncements';
import AdminUsers from '../components/AdminUsers';
import AdminAjustes from '../components/AdminAjustes';
import AdminForms from '../components/AdminForms';
import AdminBillboard from '../components/AdminBillboard';
import AdminLive from '../components/AdminLive';
import AdminAbout from '../components/AdminAbout';
import AdminCulto from '../components/AdminCulto';
import ProtectedRoute from '../components/ProtectedRoute';

import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './ThemeContext';

// ──────────────────────────────────────────────────────

const App = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <Router>
                    <Routes>
                        {/* ... existing routes ... */}
                        <Route element={<LayoutMaestro />}>
                            <Route path="/" element={<PWAGateway />} />
                            <Route path="/live" element={<Live />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/peticiones" element={<Peticiones />} />
                            <Route path="/inscripciones" element={<Inscripciones />} />
                            <Route path="/recursos" element={<Recursos />} />
                            <Route path="/login" element={<Login />} />
                        </Route>

                        <Route element={<ProtectedRoute adminOnly={true} />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin" element={<Dashboard />} />
                                <Route path="/admin/solicitudes" element={<Dashboard />} />
                                <Route path="/admin/requests" element={<Solicitudes />} />
                                <Route path="/admin/recursos" element={<AdminRecursos />} />
                                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                                <Route path="/admin/users" element={<AdminUsers />} />
                                <Route path="/admin/inscripciones" element={<AdminForms />} />
                                <Route path="/admin/cartelera" element={<AdminBillboard />} />
                                <Route path="/admin/ajustes" element={<AdminAjustes />} />
                                <Route path="/admin/live" element={<AdminLive />} />
                                <Route path="/admin/about" element={<AdminAbout />} />
                                <Route path="/admin/culto" element={<AdminCulto />} />
                                <Route path="/admin/creator" element={<AdminAnnouncements />} />
                            </Route>
                        </Route>
                    </Routes>
                </Router>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
