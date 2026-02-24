import React from 'react';
import Logo from './Logo';
import Button from './Button';
import './design.scss';

const Navbar = ({ onPrimary }) => {
  return (
    <header className="glass-card navbar" style={{ alignItems: 'center' }}>
      <Logo />
      <div className="nav-actions">
        <nav style={{ display: 'flex', gap: 16 }}>
          <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Features</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Pricing</a>
        </nav>
        <Button onClick={onPrimary}>Get Started</Button>
      </div>
    </header>
  );
};

export default Navbar;
