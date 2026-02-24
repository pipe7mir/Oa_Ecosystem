import React from 'react';
import { Navbar, GlassCard, Button } from './index';
import './design.scss';

const DemoApp = () => {
  return (
    <div style={{ minHeight: '100vh', padding: '32px', background: 'transparent' }}>
      <div className="ui-container">
        <Navbar onPrimary={() => alert('Get Started')} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          <GlassCard>
            <h2 style={{ margin: 0 }}>Bienvenido a Oasis</h2>
            <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.75)' }}>
              Este es un ejemplo de implementación Flat Design 2.0 con Glassmorphism. Los paddings y gaps
              respetan la grilla de 8px.
            </p>
            <div style={{ marginTop: 24 }}>
              <Button variant="primary">Comenzar</Button>
              <Button variant="ghost" style={{ marginLeft: 12 }}>Demo</Button>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 style={{ marginTop: 0 }}>Panel</h4>
            <ul style={{ marginTop: 12, paddingLeft: 18, color: 'rgba(255,255,255,0.8)' }}>
              <li>Token: diseño</li>
              <li>Grid: 8px</li>
              <li>Tipografías: Modern Age / San Francisco</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DemoApp;
