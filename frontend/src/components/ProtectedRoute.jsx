import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ redirectPath = '/login', adminOnly = true }) => {
    const { user, loading, canAccessAdmin } = useAuth();

    if (loading) {
        return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    }

    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }

    // Verificar si el usuario puede acceder al admin (admin o editor)
    if (adminOnly && !canAccessAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
