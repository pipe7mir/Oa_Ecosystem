import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { theme } from './styles/theme';
import Home from './modules/Home';
import Live from './modules/Live';
import About from './modules/About';
import Inscripciones from './modules/Inscripciones';
import Peticiones from '../components/Peticiones';
import Solicitudes from '../components/Solicitudes';
import Recursos from '../components/Recursos';
import AdminRecursos from '../components/AdminRecursos';
import AdminAnnouncements from '../components/AdminAnnouncements';
import AdminUsers from '../components/AdminUsers';
import AdminAjustes from '../components/AdminAjustes';
import AdminForms from '../components/AdminForms';
import AdminBillboard from '../components/AdminBillboard';
import AdminLayout from '../components/AdminLayout';
import AdminLive from '../components/AdminLive';
import AdminAbout from '../components/AdminAbout';
import OasisPress from '../components/OasisPress';
import Login from '../components/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

// Public Layout Component
const PublicLayout = () => {
    return (
        <div className="app-container d-flex flex-column" style={{
            minHeight: '100vh',
            background: `radial-gradient(circle at 10% 20%, rgb(239, 246, 255) 0%, rgb(226, 226, 226) 90%)`,
            fontFamily: theme.fonts.body,
            color: theme.colors.text.primary,
            animation: 'oasisFadeIn 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards'
        }}>
            <Navbar />
            <div className="flex-grow-1">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/live" element={<Live />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/peticiones" element={<Peticiones />} />
                    <Route path="/inscripciones" element={<Inscripciones />} />
                    <Route path="/recursos" element={<Recursos />} />
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin/solicitudes" element={<Solicitudes />} />
                        <Route path="/admin/recursos" element={<AdminRecursos />} />
                        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/inscripciones" element={<AdminForms />} />
                        <Route path="/admin/cartelera" element={<AdminBillboard />} />
                        <Route path="/admin/ajustes" element={<AdminAjustes />} />
                        <Route path="/admin/live" element={<AdminLive />} />
                        <Route path="/admin/about" element={<AdminAbout />} />
                        <Route path="/admin/oasispress" element={<OasisPress />} />
                        <Route path="/admin/creator" element={<AdminAnnouncements />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
