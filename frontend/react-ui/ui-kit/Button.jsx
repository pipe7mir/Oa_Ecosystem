import React from 'react';
import './design.scss';

const Button = ({ variant = 'primary', children, onClick, type = 'button', style, ...rest }) => {
  const wrapper = {
    display: 'inline-block',
    padding: '8px',
    borderRadius: '12px',
    background: 'rgba(124,58,237,0.06)'
  };

  const btn = {
    background: 'transparent',
    border: 'none',
    padding: '8px 24px',
    borderRadius: '8px',
    fontWeight: 700,
    color: '#7c3aed',
    cursor: 'pointer'
  };

  return (
    <span style={wrapper}>
      <button type={type} onClick={onClick} style={{ ...btn, ...style }} {...rest}>
        {children}
      </button>
    </span>
  );
};

export default Button;
