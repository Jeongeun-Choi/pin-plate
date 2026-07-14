import { useState, useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useCreatePost } from './useCreatePost';
import { usePosts } from './usePosts';
import { Place } from '../types/search';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { compressImages } from '../utils/compressImages';
import { viewModeAtom } from '@/app/atoms';
import { useMap } from '@vis.gl/react-google-maps';
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

const getUploadedPhotoKey = (item: PresignedUploadItem): string | null => {
  if (item.imageKey) return item.imageKey;
  return isTrustedImageKey(item.fileName) ? item.fileName : null;
};

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

export const usePostForm = (
  onSuccess?: () => void,
  initialPlace?: Place | null,
) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [photoReferences, setPhotoReferences] = useState<UploadedPhoto[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(
    initialPlace ?? null,
  );

  const { location: currentLocation, fetchLocation: fetchCurrentLocation } =
    useCurrentLocation();

  const { data: posts } = usePosts();

  const viewMode = useAtomValue(viewModeAtom);

  const map = useMap();

  const { mutateAsync: createPost } = useCreatePost();
  const { showErrorToast, showSuccessToast } = useToast();

  const existingReviewsForPlace = useMemo(() => {
    if (!selectedPlace || !posts) return [];
    return posts.filter((p) => p.kakao_place_id === selectedPlace.id);
  }, [selectedPlace, posts]);
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

  const handlePlaceSelect = useCallback((place: Place | null) => {
    setSelectedPlace(place);
  }, []);

  const resetForm = useCallback(() => {
    setContent('');
    setRating(0);
    setPhotoReferences([]);
    setTags([]);
    setSelectedPlace(null);
  }, []);

  const handleUploadAndSetImages = useCallback(
    async (fileList: File[]) => {
      const remainingSlots = 5 - photoReferences.length;
      if (fileList.length > remainingSlots) {
        showErrorToast({
          title: `사진은 최대 ${remainingSlots}장 더 추가할 수 있어요`,
          description: '선택한 사진 수를 줄인 뒤 다시 시도해 주세요.',
        });
        return;
      }

      const filesToUpload = await compressImages(fileList);

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
    },
    [photoReferences.length, showErrorToast],
  );

  const handleSubmit = useCallback(async () => {
    if (!selectedPlace) {
      showErrorToast({
        title: '방문한 장소를 선택해 주세요',
        description: '장소를 선택한 뒤 게시글을 등록할 수 있어요.',
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
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        showErrorToast({
          title: '로그인이 필요해요',
          description: '로그인한 사용자만 게시글을 등록할 수 있어요.',
        });
        return;
      }

      const lat = parseFloat(selectedPlace.y);
      const lng = parseFloat(selectedPlace.x);
      const address =
        selectedPlace.road_address_name || selectedPlace.address_name;

      await createPost({
        content,
        rating,
        image_urls: photoUrls,
        image_keys: photoKeys,
        place_name: selectedPlace.place_name,
        address,
        lat,
        lng,
        kakao_place_id: selectedPlace.id,
        user_id: currentUser.id,
        tags: sanitizeTags(tags),
      });

      if (viewMode === 'map' && Number.isFinite(lat) && Number.isFinite(lng)) {
        map?.setCenter({ lat, lng });
      }

      showSuccessToast({
        title: '게시글이 등록됐어요',
        description: '내 지도에서 바로 확인할 수 있어요.',
      });
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showErrorToast({
        title: '게시글 등록에 실패했어요',
        description: '잠시 후 다시 시도해 주세요.',
      });
    }
  }, [
    content,
    rating,
    photoUrls,
    photoKeys,
    tags,
    selectedPlace,
    viewMode,
    createPost,
    onSuccess,
    resetForm,
    map,
    showErrorToast,
    showSuccessToast,
  ]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotoReferences((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlers = useMemo(
    () => ({
      setContent,
      setRating,
      setTags,
      handleUploadAndSetImages,
      handleRemovePhoto,
      fetchCurrentLocation,
      handlePlaceSelect,
      resetForm,
    }),
    [
      handleUploadAndSetImages,
      handleRemovePhoto,
      fetchCurrentLocation,
      handlePlaceSelect,
      resetForm,
    ],
  );

  return {
    formState: {
      content,
      rating,
      photos: photoUrls,
      tags,
      selectedPlace,
      currentLocation,
      existingReviewsForPlace,
    },
    handlers,
    submit: handleSubmit,
  };
};
