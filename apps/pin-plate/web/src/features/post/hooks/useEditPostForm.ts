import { useMemo, useState } from 'react';
import { useUpdatePost } from './useUpdatePost';
import type { Place } from '../types/search';
import type { CreatePostPayload, Post } from '../types/post';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { compressImages } from '../utils/compressImages';
import { sanitizeTags } from '../constants/tags';
import { isTrustedImageKey } from '@/features/image/utils/imageReference';
import { useToast } from '@/providers/ToastProvider';

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
  const { showErrorToast, showSuccessToast } = useToast();

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
      showErrorToast({
        title: `사진은 최대 ${remainingSlots}장 더 추가할 수 있어요`,
        description: '선택한 사진 수를 줄인 뒤 다시 시도해 주세요.',
      });
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
      showErrorToast({
        title: '이미지 업로드를 시작하지 못했어요',
        description: '네트워크 연결을 확인하고 다시 시도해 주세요.',
      });
      return;
    }

    if (!presignedRes.ok) {
      const errorText = await presignedRes.text();
      console.error('Presigned URL Server Error:', errorText);
      showErrorToast({
        title: '이미지 업로드를 시작하지 못했어요',
        description: `서버 응답을 확인해 주세요. (${presignedRes.status})`,
      });
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
      showErrorToast({
        title: '방문한 장소를 선택해 주세요',
        description: '장소를 선택한 뒤 게시글을 수정할 수 있어요.',
      });
      return;
    }
    if (rating === 0) {
      showErrorToast({
        title: '별점을 입력해 주세요',
        description: '방문 경험을 별점으로 남겨 주세요.',
      });
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

      showSuccessToast({
        title: '게시글이 수정됐어요',
        description: '변경한 내용이 저장됐어요.',
      });
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Update Post Error:', error);

      // Supabase error handling
      const err = error as { code?: string; message?: string };
      if (err?.code) {
        showErrorToast({
          title: `게시글 수정에 실패했어요 (${err.code})`,
          description: err.message || '내 글이 아니거나 권한이 없을 수 있어요.',
        });
      } else {
        showErrorToast({
          title: '게시글 수정에 실패했어요',
          description: err?.message || '알 수 없는 오류가 발생했어요.',
        });
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
