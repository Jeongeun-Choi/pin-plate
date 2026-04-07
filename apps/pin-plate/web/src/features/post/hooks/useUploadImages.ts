import { Dispatch, SetStateAction } from 'react';

export const useUploadImages = (
  photos: string[],
  setPhotos: Dispatch<SetStateAction<string[]>>,
  maxCount: number = 5,
) => {
  const handleUploadAndSetImages = async (fileList: File[]) => {
    const remainingSlots = maxCount - photos.length;
    if (fileList.length > remainingSlots) {
      alert(`최대 ${remainingSlots}장까지만 더 추가할 수 있습니다.`);
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => formData.append('files', file));

    try {
      const res = await fetch('/api/image', { method: 'POST', body: formData });
      if (!res.ok) {
        let errorMessage = `서버 에러 (${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // JSON 파싱 실패 시 기본 메시지 유지
        }
        throw new Error(errorMessage);
      }
      const { urls } = await res.json();
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error('Upload Error:', err);
      const message =
        err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
      alert(`이미지 업로드 실패: ${message}`);
    }
  };

  return { handleUploadAndSetImages };
};
