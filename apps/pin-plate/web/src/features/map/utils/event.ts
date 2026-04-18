/**
 * MouseEvent(데스크톱)와 TouchEvent(모바일) 모두에서
 * clientX/clientY를 안전하게 추출한다.
 */
export const getClientPosition = (
  domEvent: MouseEvent | TouchEvent,
): { clientX: number; clientY: number } => {
  if ('changedTouches' in domEvent) {
    const touch = domEvent.changedTouches[0];
    return { clientX: touch?.clientX ?? 0, clientY: touch?.clientY ?? 0 };
  }
  return { clientX: domEvent.clientX, clientY: domEvent.clientY };
};
