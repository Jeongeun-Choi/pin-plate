import { useRef, useCallback, useEffect, RefObject } from 'react';
import { Post } from '../types/post';

interface UsePostDetailScrollParams {
  id: string;
  allReviews: Post[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

interface UsePostDetailScrollResult {
  scrollRef: RefObject<HTMLDivElement | null>;
  sectionRefs: RefObject<Record<number, HTMLElement | null>>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const usePostDetailScroll = ({
  id,
  allReviews,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UsePostDetailScrollParams): UsePostDetailScrollResult => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const hasAlignedInitialPostRef = useRef(false);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop - clientHeight < 150 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const containsInitialPost = allReviews.some(
      (review) => review.id === Number(id),
    );
    if (!containsInitialPost && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [allReviews, id, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (
      el &&
      el.scrollHeight <= el.clientHeight &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [allReviews, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (hasAlignedInitialPostRef.current) return;
    const initialSection = sectionRefs.current[Number(id)];
    if (!initialSection) return;
    initialSection.scrollIntoView({ block: 'start', behavior: 'auto' });
    hasAlignedInitialPostRef.current = true;
  }, [allReviews, id]);

  return { scrollRef, sectionRefs, handleScroll };
};
