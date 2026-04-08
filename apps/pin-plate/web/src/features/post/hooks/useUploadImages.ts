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

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: fileList.map((f) => ({ name: f.name, type: f.type })),
        }),
      });

      if (!res.ok) {
        let errorMessage = `서버 에러 (${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 유지
        }
        throw new Error(errorMessage);
      }

      const { files: presignedFiles } = await res.json();

      const uploadResults = await Promise.allSettled(
        presignedFiles.map(
          (
            {
              presignedUrl,
              publicUrl,
            }: { presignedUrl: string; publicUrl: string },
            i: number,
          ) =>
            fetch(presignedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': fileList[i].type },
              body: fileList[i],
            }).then((putRes) => {
              if (!putRes.ok)
                throw new Error(`S3 업로드 실패 (${putRes.status})`);
              return publicUrl;
            }),
        ),
      );

      const successUrls = uploadResults
        .filter(
          (r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled',
        )
        .map((r) => r.value);

      const failCount = uploadResults.filter(
        (r) => r.status === 'rejected',
      ).length;

      if (failCount > 0) {
        alert(`${fileList.length}개 중 ${failCount}개 업로드에 실패했습니다.`);
      }

      if (successUrls.length > 0) {
        setPhotos((prev) => [...prev, ...successUrls]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
      alert(`이미지 업로드 실패: ${message}`);
    }
  };

  return { handleUploadAndSetImages };
};
