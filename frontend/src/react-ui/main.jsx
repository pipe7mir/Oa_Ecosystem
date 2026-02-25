import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import '../styles/custom.css';
import { AuthProvider } from '../context/AuthContext';

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ErrorBoundary>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
    console.log('React app rendered successfully');
} else {
    console.warn('React root element not found. Skipping React render.');
}
