interface GetShareMapPrimaryActionParams {
  canCreateShareMap: boolean;
  isCreatingSharedMap: boolean;
  shareUrl: string;
  onCreateShareMap: () => void;
  onShareUrl: () => void;
}

export const getShareMapPrimaryAction = ({
  canCreateShareMap,
  isCreatingSharedMap,
  shareUrl,
  onCreateShareMap,
  onShareUrl,
}: GetShareMapPrimaryActionParams) => {
  if (shareUrl) {
    return {
      label: '공유하기',
      isDisabled: false,
      onClick: onShareUrl,
    };
  }

  if (isCreatingSharedMap) {
    return {
      label: '공유 링크 만드는 중',
      isDisabled: !canCreateShareMap,
      onClick: onCreateShareMap,
    };
  }

  return {
    label: '공유 링크 만들기',
    isDisabled: !canCreateShareMap,
    onClick: onCreateShareMap,
  };
};
