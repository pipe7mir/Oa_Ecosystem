import axios from 'axios';

// En desarrollo usamos el localhost de NestJS. 
// En producción, es OBLIGATORIO configurar VITE_API_URL en Vercel con la URL de Railway.
let base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
if (!base.endsWith('/api')) {
    base = base.replace(/\/$/, '') + '/api';
}
const baseURL = base;

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
