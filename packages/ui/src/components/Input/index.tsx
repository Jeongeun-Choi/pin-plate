import { InputHTMLAttributes } from "react";
import { inputStyle } from "./styles.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = (props: InputProps) => {
  return <input className={inputStyle} {...props} />;
};
