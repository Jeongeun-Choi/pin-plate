import { useMemo, useState } from 'react';
import { useUpdatePost } from './useUpdatePost';
import type { Place } from '../types/search';
import type { CreatePostPayload, Post } from '../types/post';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { compressImages } from '../utils/compressImages';
import { sanitizeTags } from '../constants/tags';
import { isTrustedImageKey } from '@/features/image/utils/imageReference';

interface UploadedPhoto {
  key: string | null;
  url: string;
}

interface PresignedUploadItem {
  originalName: string;
  fileName: string;
  imageKey?: string;
  url: string;
  fields: Record<string, string>;
  objectUrl: string;
  publicUrl?: string;
}

const UPLOAD_METADATA_FIELD_NAMES = new Set([
  'url',
  'objectUrl',
  'publicUrl',
  'imageKey',
  'fileName',
  'originalName',
]);

interface UseEditPostFormOptions {
  onSubmitOverride?: (payload: CreatePostPayload) => Promise<void> | void;
}

const getUploadedPhotoKey = (item: PresignedUploadItem): string | null => {
  if (item.imageKey) return item.imageKey;
  return isTrustedImageKey(item.fileName) ? item.fileName : null;
};

const getInitialPhotoReferences = (post: Post): UploadedPhoto[] =>
  (post.image_urls || []).map((imageUrl, index) => ({
    key: post.image_keys?.[index] ?? null,
    url: imageUrl,
  }));

const appendPresignedPostFields = (
  formData: FormData,
  fields: Record<string, string>,
) => {
  Object.entries(fields).forEach(([key, value]) => {
    if (!UPLOAD_METADATA_FIELD_NAMES.has(key)) {
      formData.append(key, value);
    }
  });
};

export const useEditPostForm = (
  initialData: Post,
  onSuccess?: () => void,
  options?: UseEditPostFormOptions,
) => {
  const [content, setContent] = useState(initialData.content);
  const [rating, setRating] = useState(initialData.rating);
  const [photoReferences, setPhotoReferences] = useState<UploadedPhoto[]>(() =>
    getInitialPhotoReferences(initialData),
  );
  const [tags, setTags] = useState<string[]>(initialData.tags ?? []);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>({
    id: initialData.kakao_place_id,
    place_name: initialData.place_name,
    address_name: initialData.address,
    road_address_name: initialData.address,
    x: String(initialData.lng),
    y: String(initialData.lat),
    phone: '', // Optional or empty if not stored
    category_group_code: '',
    category_group_name: '',
    category_name: '',
    distance: '',
    place_url: '',
  });

  const { location: currentLocation, fetchLocation: fetchCurrentLocation } =
    useCurrentLocation();

  const { mutateAsync: updatePost } = useUpdatePost();

  const photoUrls = useMemo(
    () => photoReferences.map((photoReference) => photoReference.url),
    [photoReferences],
  );
  const photoKeys = useMemo(
    () =>
      photoReferences
        .map((photoReference) => photoReference.key)
        .filter((photoKey): photoKey is string => Boolean(photoKey)),
    [photoReferences],
  );

  const handlePlaceSelect = (place: Place | null) => {
    setSelectedPlace(place);
  };

  const handleUploadAndSetImages = async (fileList: File[]) => {
    const remainingSlots = 5 - photoReferences.length;
    if (fileList.length > remainingSlots) {
      alert(`최대 ${remainingSlots}장까지만 더 추가할 수 있습니다.`);
      return;
    }

    const filesToUpload = await compressImages(fileList);

    // 1. Presigned URL Request
    let presignedRes;
    try {
      presignedRes = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToUpload.map((f) => ({
            filename: f.name.replace(/\.[^.]+$/, '.webp'),
            type: f.type,
          })),
        }),
      });
    } catch (err) {
      console.error('Presigned URL Network Error:', err);
      alert(`서버 연결 실패: /api/image 에 접근할 수 없습니다.\n${err}`);
      return;
    }

    if (!presignedRes.ok) {
      const errorText = await presignedRes.text();
      console.error('Presigned URL Server Error:', errorText);
      alert(
        `서버 에러 (${presignedRes.status}): 이미지 URL을 받아오지 못했습니다.`,
      );
      return;
    }

    const { urls } = await presignedRes.json();

    // 2. Upload to S3
    const uploadPromises = urls.map(
      async (item: PresignedUploadItem, index: number) => {
        const file = filesToUpload[index];
        try {
          const formData = new FormData();
          appendPresignedPostFields(formData, item.fields);
          formData.append('file', file);
          const s3Res = await fetch(item.url, {
            method: 'POST',
            body: formData,
          });
          if (!s3Res.ok) throw new Error(`S3 Error: ${s3Res.status}`);
          return {
            key: getUploadedPhotoKey(item),
            url: item.publicUrl ?? item.objectUrl,
          };
        } catch (err) {
          console.error('S3 Upload Error:', err);
          throw new Error('S3 CORS or Network Error');
        }
      },
    );

    try {
      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotoReferences((prev) => [...prev, ...uploadedPhotos]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedPlace) {
      alert('방문한 장소를 선택해주세요.');
      return;
    }
    if (rating === 0) {
      alert('별점을 입력해주세요.');
      return;
    }

    try {
      const payload: CreatePostPayload = {
        content,
        rating,
        image_urls: photoUrls,
        image_keys: photoKeys,
        place_name: selectedPlace.place_name,
        address: selectedPlace.road_address_name || selectedPlace.address_name,
        lat: parseFloat(selectedPlace.y),
        lng: parseFloat(selectedPlace.x),
        kakao_place_id: selectedPlace.id,
        user_id: initialData.user_id,
        tags: sanitizeTags(tags),
      };

      if (options?.onSubmitOverride) {
        await options.onSubmitOverride(payload);
      } else {
        await updatePost({
          id: initialData.id,
          payload,
        });
      }

      alert('게시글이 수정되었습니다!');
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Update Post Error:', error);

      // Supabase error handling
      const err = error as { code?: string; message?: string };
      if (err?.code) {
        alert(
          `게시글 수정 실패 (${err.code}): ${err.message || ''}\n(내 글이 아니거나 권한이 없을 수 있습니다)`,
        );
      } else {
        alert(
          `게시글 수정에 실패했습니다.\n${err?.message || '알 수 없는 오류'}`,
        );
      }
    }
  };

  return {
    formState: {
      content,
      rating,
      photos: photoUrls,
      tags,
      selectedPlace,
      currentLocation,
    },
    handlers: {
      setContent,
      setRating,
      setTags,
      handleUploadAndSetImages,
      handleRemovePhoto,
      fetchCurrentLocation,
      handlePlaceSelect,
    },
    submit: handleSubmit,
  };
};
