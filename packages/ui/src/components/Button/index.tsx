import { ButtonHTMLAttributes } from "react";
import { buttonStyle } from "./styles.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <button className={buttonStyle} onClick={onClick}>
      {children}
    </button>
  );
};
