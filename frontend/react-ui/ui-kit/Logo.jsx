import React from 'react';
import './design.scss';

const Logo = ({ small }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: small ? 36 : 48,
          height: small ? 36 : 48,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
          boxShadow: '0 8px 24px rgba(7,10,31,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={small ? 18 : 22} height={small ? 18 : 22} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.14" />
          <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: "Modern Age, -apple-system, BlinkMacSystemFont", fontWeight: 700, fontSize: small ? 14 : 18, color: 'white' }}>
          Oasis
        </span>
        <small style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco'", color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
          Design System
        </small>
      </div>
    </div>
  );
};

export default Logo;
