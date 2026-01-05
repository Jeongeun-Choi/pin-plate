import React from 'react';
import { buttonStyle } from './Button.css';

export const Button = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <button className={buttonStyle} onClick={onClick}>
      {children}
    </button>
  );
};
