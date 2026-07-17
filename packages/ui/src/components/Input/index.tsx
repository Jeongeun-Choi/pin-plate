import { InputHTMLAttributes, Ref } from 'react';
import { inputRecipe } from './styles.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement | null>;
  unstyled?: boolean;
}

export const Input = (props: InputProps) => {
  const { ref, className, unstyled = false, ...rest } = props;
  const inputClassName = unstyled
    ? className || ''
    : `${inputRecipe} ${className || ''}`;

  return <input className={inputClassName} ref={ref} {...rest} />;
};
