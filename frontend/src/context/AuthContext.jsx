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
                    // Try to parse stored user, or fetch fresh from API
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    // Verify token is still valid
                    const res = await apiClient.get('/user');
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (err) {
                    console.error('Session expired or invalid', err);
                    signOut();
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

    const value = {
        signIn,
        signOut,
        user,
        session,
        loading,
        isAdmin: user?.role === 'admin' || user?.email?.includes('admin'),
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

