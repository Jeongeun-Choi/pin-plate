import { InputHTMLAttributes, Ref } from 'react';
import { inputStyle } from './styles.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement | null>;
}

export const Input = (props: InputProps) => {
  const { ref, className, ...rest } = props;
  return (
    <input className={`${inputStyle} ${className || ''}`} ref={ref} {...rest} />
  );
};
