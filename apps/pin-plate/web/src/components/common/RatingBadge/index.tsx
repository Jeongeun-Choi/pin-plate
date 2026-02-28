import { IcFilledstar } from '@pin-plate/ui';
import * as styles from './styles.css';

interface RatingBadgeProps {
  score: number;
}

export default function RatingBadge({ score }: RatingBadgeProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <IcFilledstar width="100%" height="100%" />
      </div>
      <span className={styles.text}>{score.toFixed(1)}</span>
    </div>
  );
}
