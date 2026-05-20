import { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { IcCheck } from '../../icons';
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
    <span className={s.checkboxControl}>
      <input
        ref={ref}
        className={`${s.checkboxInput} ${inputClassName || ''}`}
        type="checkbox"
        {...props}
      />
      <span className={s.checkboxIndicator} aria-hidden="true">
        <IcCheck width={14} height={14} />
      </span>
    </span>
    <span className={`${s.labelText} ${textClassName || ''}`}>{label}</span>
  </label>
);
