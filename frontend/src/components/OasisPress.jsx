import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../react-ui/styles/theme';
import apiClient from '../api/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';

// Constantes útiles
const FONTS = [
    { name: 'Trebuchet MS', label: 'Trebuchet MS' },
    { name: 'AdventSans', label: 'Advent Sans' },
    { name: 'ModernAge', label: 'Modern Age' },
    { name: 'Arial', label: 'Arial' },
    { name: 'Georgia', label: 'Georgia' },
    { name: 'Times New Roman', label: 'Times New Roman' },
    { name: 'Verdana', label: 'Verdana' },
    { name: 'Courier New', label: 'Courier New' },
    { name: 'Impact', label: 'Impact' },
];

const COLORS = ['#5b2ea6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#000000', '#ffffff', '#6b7280'];

const createDefaultSlide = () => ({
    id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order: 0,
    background: '#ffffff',
    backgroundImage: '',
    elements: [],
});

// Componente base
const OasisPress = () => {
    const [presentations, setPresentations] = useState([]);

    return (
        <div className="container-fluid py-4">
            <h2>OasisPress - Editor de Presentaciones</h2>
            {/* Aquí puedes ir integrando el resto del render y componentes */}
        </div>
    );
};

export default OasisPress;
