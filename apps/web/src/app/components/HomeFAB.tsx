import { useRouter } from 'next/navigation';
import * as styles from './HomeFAB.css';

export const HomeFAB = ({ onClick }: { onClick: () => void }) => {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => router.push('/my-page')}
        className={styles.myPageButton}
      >
        MY
      </button>
      <button onClick={onClick} className={styles.fabButton}>
        +
      </button>
    </>
  );
};
