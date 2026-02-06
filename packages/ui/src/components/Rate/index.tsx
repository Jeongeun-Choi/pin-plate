import { MouseEvent } from 'react';
import { RecipeVariants } from '@vanilla-extract/recipes';
import * as Styled from './styles.css';

export interface IRateProps {
  value?: number;
  onChange?: (value: number) => void;
  size?: NonNullable<RecipeVariants<typeof Styled.starWrapper>>['size'];
  readonly?: boolean;
}

export function Rate({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
}: IRateProps) {
  const handleStarClick = (
    event: MouseEvent<HTMLSpanElement>,
    index: number,
  ) => {
    if (readonly || !onChange) return;

    const { offsetX } = event.nativeEvent;
    const { offsetWidth } = event.currentTarget;
    const isHalf = offsetX < offsetWidth / 2;

    onChange(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div>
      {[0, 1, 2, 3, 4].map((index) => {
        let fillWidth = '0%';
        if (value >= index + 1) {
          fillWidth = '100%';
        } else if (value === index + 0.5) {
          fillWidth = '50%';
        }

        return (
          <span
            key={index}
            className={Styled.starWrapper({ size, readonly })}
            onClick={(e) => handleStarClick(e, index)}
          >
            <span className={Styled.starBase}>★</span>
            <span className={Styled.starOverlay} style={{ width: fillWidth }}>
              ★
            </span>
          </span>
        );
      })}
    </div>
  );
}
