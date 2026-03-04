import { IcFork } from '../../icons/IcFork';
import { spinnerStyle } from './styles.css';

export const Spinner = ({
  color = '#ffa07a',
  size = 48,
}: {
  color?: string;
  size?: number;
}) => <IcFork color={color} size={size} className={spinnerStyle} />;
