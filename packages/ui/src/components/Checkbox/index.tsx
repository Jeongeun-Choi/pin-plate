import { InputHTMLAttributes, ReactNode, Ref } from 'react';
import * as s from './styles.css';

interface Props extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type'
> {
  label: ReactNode;
  className?: string;
  inputClassName?: string;
  textClassName?: string;
  ref?: Ref<HTMLInputElement | null>;
}

export const Checkbox = ({
  label,
  className,
  inputClassName,
  textClassName,
  ref,
  ...props
}: Props) => (
  <label className={`${s.checkboxLabel} ${className || ''}`}>
    <input
      ref={ref}
      className={`${s.checkboxInput} ${inputClassName || ''}`}
      type="checkbox"
      {...props}
    />
    <span className={`${s.labelText} ${textClassName || ''}`}>{label}</span>
  </label>
);
