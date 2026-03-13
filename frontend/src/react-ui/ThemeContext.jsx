import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from './styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('oasis_theme_mode') || 'light';
    });

    const theme = createTheme(mode);

    const toggleMode = () => {
        setMode(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        localStorage.setItem('oasis_theme_mode', mode);
        document.body.style.backgroundColor = theme.colors.background;
    }, [mode, theme.colors.background]);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
