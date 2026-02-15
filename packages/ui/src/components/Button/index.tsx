import { ButtonHTMLAttributes } from 'react';
import { RecipeVariants } from '@vanilla-extract/recipes';
import { buttonRecipe } from './styles.css';

type ButtonVariants = RecipeVariants<typeof buttonRecipe>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    className?: string;
  };

export const Button = ({
  children,
  className,
  variant = 'solid',
  size,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${buttonRecipe({ variant, size })} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
