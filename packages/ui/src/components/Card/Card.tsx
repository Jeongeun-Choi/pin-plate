import * as React from 'react';
import * as styles from './styles.css';
import { IcFilledBookmark, IcFilledstar, IcFork, IcMarker } from '../../icons';

type CardIndicatorIcon = 'star' | 'bookmark';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  rating: string | number;
  ratingIcon?: CardIndicatorIcon;
  ratingAriaLabel?: string;
  location: string;
  description: string;
  date: string;
  imageUrl?: string;
  srcSet?: string;
  sizes?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      rating,
      ratingIcon = 'star',
      ratingAriaLabel,
      location,
      description,
      date,
      imageUrl,
      srcSet,
      sizes,
      className,
      ...props
    },
    ref,
  ) => {
    const IndicatorIcon =
      ratingIcon === 'bookmark' ? IcFilledBookmark : IcFilledstar;
    const shouldShowRatingText = String(rating).trim().length > 0;

    return (
      <div ref={ref} className={`${styles.card} ${className || ''}`} {...props}>
        <div className={styles.cardImageWrapper}>
          {imageUrl ? (
            <img
              src={imageUrl}
              srcSet={srcSet}
              sizes={sizes}
              alt={title}
              loading="lazy"
              className={styles.cardImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <IcFork size={52} color="#ffa07a" />
            </div>
          )}
        </div>

        <div className={styles.cardInfo}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <div
              className={`${styles.ratingBadge} ${ratingIcon === 'bookmark' ? styles.bookmarkRatingBadge : ''}`}
              aria-label={ratingAriaLabel}
            >
              <IndicatorIcon width={16} height={16} color="#ffd93d" />
              {shouldShowRatingText && (
                <span className={styles.ratingText}>{rating}</span>
              )}
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
