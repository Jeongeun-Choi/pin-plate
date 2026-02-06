'use client';
import Image from 'next/image';
import * as styles from './styles/EditPostContent.styles.css';
import { Post } from '../types/post';
import { Input, Rate, Textarea } from '@pin-plate/ui';
import RatingBadge from '@/components/common/RatingBadge';
import AddPhotoButton from '@/components/common/AddPhotoButton';

interface IEditPostContentProps {
  post: Post;
}

export default function EditPostContent({ post }: IEditPostContentProps) {
  return (
    <>
      <form className={styles.form}>
        <div className={styles.fieldWrapper}>
          <label htmlFor="location" className={styles.label}>
            장소 검색
          </label>
          <Input id="location" value={post.place_name} />
        </div>

        <div className={styles.fieldWrapper}>
          <label htmlFor="rate" className={styles.label}>
            평점
          </label>
          <div className={styles.ratingContainer}>
            <Rate value={post.rating} />
            <RatingBadge score={post.rating} />
          </div>
        </div>

        <div className={styles.fieldWrapper}>
          <label htmlFor="description" className={styles.label}>
            상세 설명
          </label>
          <Textarea value={post.content} />
        </div>

        <div className={styles.fieldWrapper}>
          <label htmlFor="picture" className={styles.label}>
            사진
          </label>
          <div className={styles.imageList}>
            <AddPhotoButton onClick={() => console.log('Add photo clicked')} />
            {post.image_urls.map((image, index) => (
              <Image
                key={index}
                src={image}
                width={110}
                height={110}
                alt={`uploaded-${index}`}
                className={styles.imageItem}
              />
            ))}
          </div>
        </div>
      </form>
    </>
  );
}
