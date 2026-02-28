import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { theme } from './styles/theme';

// ── Layouts ──────────────────────────────────────────
import LayoutMaestro from './components/LayoutMaestro';  // nuevo: sidebar / bottom-nav
import AdminLayout from '../components/AdminLayout';    // admin: sin cambios

// ── Gateway inteligente PWA/Web ───────────────────────
import PWAGateway from './components/PWAGateway';

// ── Módulos Públicos ──────────────────────────────────
import Home from './modules/Home';
import Live from './modules/Live';
import About from './modules/About';
import Inscripciones from './modules/Inscripciones';
import Peticiones from '../components/Peticiones';
import Recursos from '../components/Recursos';
import Login from '../components/Login';

// ── Módulos Admin ─────────────────────────────────────
import Solicitudes from '../components/Solicitudes';
import AdminRecursos from '../components/AdminRecursos';
import AdminAnnouncements from '../components/AdminAnnouncements';
import AdminUsers from '../components/AdminUsers';
import AdminAjustes from '../components/AdminAjustes';
import AdminForms from '../components/AdminForms';
import AdminBillboard from '../components/AdminBillboard';
import AdminLive from '../components/AdminLive';
import AdminAbout from '../components/AdminAbout';
import ProtectedRoute from '../components/ProtectedRoute';

// ──────────────────────────────────────────────────────

const App = () => {
    return (
        <Router>
            <Routes>

                {/* ╔══════════════════════════════════╗
                    ║  RUTAS PÚBLICAS — LayoutMaestro  ║
                    ╚══════════════════════════════════╝
                    En Desktop → sidebar lateral fija
                    En Mobile  → header sticky + BottomNav */}
                <Route element={<LayoutMaestro />}>

                    {/* ── Raíz inteligente: Landing (web) o redirect (PWA) ── */}
                    <Route path="/" element={<PWAGateway />} />

                    {/* ── Páginas públicas ── */}
                    <Route path="/live" element={<Live />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/peticiones" element={<Peticiones />} />
                    <Route path="/inscripciones" element={<Inscripciones />} />
                    <Route path="/recursos" element={<Recursos />} />
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* ╔══════════════════════════════════╗
                    ║  RUTAS ADMIN — AdminLayout       ║
                    ╚══════════════════════════════════╝
                    Sin cambios respecto al layout anterior */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminAnnouncements />} />
                        <Route path="/admin/solicitudes" element={<Solicitudes />} />
                        <Route path="/admin/recursos" element={<AdminRecursos />} />
                        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/inscripciones" element={<AdminForms />} />
                        <Route path="/admin/cartelera" element={<AdminBillboard />} />
                        <Route path="/admin/ajustes" element={<AdminAjustes />} />
                        <Route path="/admin/live" element={<AdminLive />} />
                        <Route path="/admin/about" element={<AdminAbout />} />
                        <Route path="/admin/creator" element={<AdminAnnouncements />} />
                    </Route>
                </Route>

            </Routes>
        </Router>
    );
};

export default App;
