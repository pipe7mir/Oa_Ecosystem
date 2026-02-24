import React from 'react';
import './design.scss';

const GlassCard = ({ children, style, className = '', ...rest }) => {
  return (
    <div className={`glass-card ${className}`} style={{ padding: '24px', ...style }} {...rest}>
      {children}
    </div>
  );
};

export default GlassCard;
