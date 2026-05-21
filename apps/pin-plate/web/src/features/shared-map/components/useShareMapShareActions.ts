import { useCallback } from 'react';
import { useCreateSharedMap } from '../hooks/useCreateSharedMap';
import type { ShareMapDialogState } from './useShareMapDialogState';

interface Props {
  dialogState: ShareMapDialogState;
  ownerId: string;
}

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

export const useShareMapShareActions = ({ dialogState, ownerId }: Props) => {
  const { mutateAsync: createSharedMap, isPending: isCreatingSharedMap } =
    useCreateSharedMap();
  const {
    criteriaType,
    criteriaValue,
    description,
    handleErrorMessageChange,
    handleShareFeedbackMessageChange,
    handleShareUrlCreated,
    hasNoShareablePlaces,
    limitedPlaces,
    shareMapTitle,
    shareUrl,
    title,
  } = dialogState;

  const canCreateShareMap = !hasNoShareablePlaces && !isCreatingSharedMap;

  const handleCreateShareMap = useCallback(async () => {
    if (limitedPlaces.length === 0) {
      handleErrorMessageChange('공유할 장소가 없어요.');
      return false;
    }

    try {
      handleErrorMessageChange('');
      handleShareFeedbackMessageChange('');
      const sharedMap = await createSharedMap({
        ownerId,
        payload: {
          title: shareMapTitle,
          description,
          criteriaType,
          criteriaValue,
          places: limitedPlaces,
        },
      });
      const nextShareUrl = `${window.location.origin}/share/${sharedMap.slug}`;
      handleShareUrlCreated(nextShareUrl);
      return true;
    } catch {
      handleShareFeedbackMessageChange('');
      handleErrorMessageChange(
        '공유 링크를 만들지 못했어요. 다시 시도해 주세요.',
      );
      return false;
    }
  }, [
    createSharedMap,
    criteriaType,
    criteriaValue,
    description,
    handleErrorMessageChange,
    handleShareFeedbackMessageChange,
    handleShareUrlCreated,
    limitedPlaces,
    ownerId,
    shareMapTitle,
  ]);

  const handleShareUrl = useCallback(async () => {
    if (!shareUrl) {
      return;
    }

    try {
      handleErrorMessageChange('');
      handleShareFeedbackMessageChange('');
      if (navigator.share) {
        try {
          await navigator.share({
            title: title.trim() || 'Pin-plate 공유 지도',
            text:
              description.trim() ||
              `${limitedPlaces.length}개의 장소를 공유해요.`,
            url: shareUrl,
          });
          handleShareFeedbackMessageChange('공유 옵션을 열었어요.');
          return;
        } catch (shareError) {
          if (isAbortError(shareError)) {
            return;
          }
        }
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        handleShareFeedbackMessageChange('링크를 복사했어요.');
        return;
      }

      handleShareFeedbackMessageChange('');
      handleErrorMessageChange('복사에 실패했어요. 링크를 직접 복사해 주세요.');
    } catch {
      handleShareFeedbackMessageChange('');
      handleErrorMessageChange('복사에 실패했어요. 링크를 직접 복사해 주세요.');
    }
  }, [
    description,
    handleErrorMessageChange,
    handleShareFeedbackMessageChange,
    limitedPlaces.length,
    shareUrl,
    title,
  ]);

  return {
    canCreateShareMap,
    handleCreateShareMap,
    handleShareUrl,
    isCreatingSharedMap,
  };
};
