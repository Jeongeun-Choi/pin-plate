import * as React from 'react';
import * as styles from './styles.css';
import { IcFilledstar, IcMarker } from '../../icons';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  rating: string | number;
  location: string;
  description: string;
  date: string;
  imageUrl: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      rating,
      location,
      description,
      date,
      imageUrl,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={`${styles.card} ${className || ''}`} {...props}>
        <div className={styles.cardImageWrapper}>
          <img src={imageUrl} alt={title} className={styles.cardImage} />
        </div>

        <div className={styles.cardInfo}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <div className={styles.ratingBadge}>
              <IcFilledstar width={16} height={16} color="#ffd93d" />
              <span className={styles.ratingText}>{rating}</span>
            </div>
          </div>

          <div className={styles.locationRow}>
            <IcMarker width={16} height={16} color="#9CA3AF" />
            <span className={styles.locationText}>{location}</span>
          </div>

          <p className={styles.cardContent}>{description}</p>

          <span className={styles.cardDate}>{date}</span>
        </div>
      </div>
    );
  },
);

Card.displayName = 'Card';
