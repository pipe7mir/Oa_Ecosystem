import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                setSession({ access_token: token });
                try {
                    // Cargar usuario del localStorage
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    // Verificar token en segundo plano (sin cerrar sesión si falla)
                    apiClient.get('/user').then(res => {
                        // Solo actualizar si la respuesta tiene datos completos
                        if (res.data && (res.data.email || res.data.name)) {
                            setUser(res.data);
                            localStorage.setItem('user', JSON.stringify(res.data));
                        }
                    }).catch(err => {
                        // Si es 401 (token expirado), cerrar sesión
                        if (err.response?.status === 401) {
                            console.error('Token expired', err);
                            signOut();
                        }
                        // Otros errores no cierran sesión (problemas de red, etc)
                    });
                } catch (err) {
                    console.error('Error parsing stored user', err);
                    // Solo limpiar si hay error de parsing
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const signIn = async (data) => {
        const response = await apiClient.post('/login', data);
        const { token, user: userData } = response.data;

        if (token && userData) {
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setSession({ access_token: token });
            setUser(userData);
        }
        return response;
    };

    const signOut = async () => {
        try {
            await apiClient.post('/logout');
        } catch (e) {
            // Ignorar errores al desloguear
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setSession(null);
            setUser(null);
        }
    };

    // Roles que pueden acceder al panel de administración
    const adminRoles = ['admin', 'editor'];
    const canAccessAdmin = user && adminRoles.includes(user.role);
    
    const value = {
        signIn,
        signOut,
        user,
        session,
        loading,
        isAdmin: user?.role === 'admin',
        isEditor: user?.role === 'editor', 
        canAccessAdmin, // admin o editor pueden ver el panel
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

