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
import { saveFilesToLocalDB } from '@/features/local-db/utils/imageProcessor';
import { useLocalCreatePost } from '@/features/local-db/hooks/useLocalCreatePost';
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
  const [localPhotoRefs, setLocalPhotoRefs] = useState<
    Array<{ id: string; previewUrl: string }>
  >([]);
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
  const { mutateAsync: localCreatePost } = useLocalCreatePost();

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
    setLocalPhotoRefs([]);
    setTags([]);
    setSelectedPlace(null);
  }, []);

  const handleUploadAndSetImages = useCallback(
    async (fileList: File[]) => {
      const remainingSlots = 5 - photoReferences.length - localPhotoRefs.length;
      if (fileList.length > remainingSlots) {
        alert(`최대 ${remainingSlots}장까지만 더 추가할 수 있습니다.`);
        return;
      }

      const currentUser = await getCurrentUser();

      if (!currentUser) {
        try {
          const saved = await saveFilesToLocalDB(fileList);
          setLocalPhotoRefs((prev) => [...prev, ...saved]);
        } catch (err) {
          console.error('Local image save error:', err);
          alert('이미지 저장에 실패했습니다.');
        }
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
    [photoReferences.length, localPhotoRefs.length],
  );

  const handleSubmit = useCallback(async () => {
    if (!selectedPlace) {
      alert('방문한 장소를 선택해주세요.');
      return;
    }
    if (rating === 0) {
      alert('별점을 입력해주세요.');
      return;
    }

    try {
      const currentUser = await getCurrentUser();

      const lat = parseFloat(selectedPlace.y);
      const lng = parseFloat(selectedPlace.x);
      const address =
        selectedPlace.road_address_name || selectedPlace.address_name;

      if (!currentUser) {
        await localCreatePost({
          place: {
            kakao_place_id: selectedPlace.id,
            place_name: selectedPlace.place_name,
            address,
            lat,
            lng,
          },
          post: {
            content,
            rating,
            tags: sanitizeTags(tags),
          },
          imageIds: localPhotoRefs.map((r) => r.id),
        });
        resetForm();
        onSuccess?.();
        return;
      }

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

      alert('게시글이 등록되었습니다!');
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert('게시글 등록에 실패했습니다.');
    }
  }, [
    content,
    rating,
    photoUrls,
    photoKeys,
    localPhotoRefs,
    tags,
    selectedPlace,
    viewMode,
    createPost,
    localCreatePost,
    onSuccess,
    resetForm,
    map,
  ]);

  const handleRemovePhoto = useCallback(
    (index: number) => {
      if (localPhotoRefs.length > 0) {
        setLocalPhotoRefs((prev) => prev.filter((_, i) => i !== index));
        return;
      }
      setPhotoReferences((prev) => prev.filter((_, i) => i !== index));
    },
    [localPhotoRefs.length],
  );

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
      photos:
        localPhotoRefs.length > 0
          ? localPhotoRefs.map((r) => r.previewUrl)
          : photoUrls,
      tags,
      selectedPlace,
      currentLocation,
      existingReviewsForPlace,
    },
    handlers,
    submit: handleSubmit,
  };
};
