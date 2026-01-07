import { TextareaHTMLAttributes } from "react";
import { textareaStyle } from "./styles.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = (props: TextareaProps) => {
  return <textarea className={textareaStyle} {...props} />;
};
