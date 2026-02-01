import { ButtonHTMLAttributes } from 'react';
import { buttonStyle } from './styles.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button className={`${buttonStyle} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};
