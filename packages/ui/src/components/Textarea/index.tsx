import { TextareaHTMLAttributes } from 'react';
import { textareaStyle } from './styles.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = (props: TextareaProps) => {
  const { className, ...rest } = props;
  return (
    <textarea className={`${textareaStyle} ${className || ''}`} {...rest} />
  );
};
