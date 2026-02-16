import { InputHTMLAttributes, Ref } from 'react';
import { inputRecipe } from './styles.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement | null>;
}

export const Input = (props: InputProps) => {
  const { ref, className, ...rest } = props;
  return (
    <input
      className={`${inputRecipe} ${className || ''}`}
      ref={ref}
      {...rest}
    />
  );
};
