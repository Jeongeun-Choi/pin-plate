import { useState } from 'react';
import { useCreatePost } from './useCreatePost';
import { KakaoPlace } from '../types/search';
import { createClient } from '@/utils/supabase/client';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { compressImages } from '../utils/compressImages';

export const usePostForm = (
  onSuccess?: () => void,
  initialPlace?: KakaoPlace | null,
) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(
    initialPlace ?? null,
  );

  const { location: currentLocation, fetchLocation: fetchCurrentLocation } =
    useCurrentLocation();

  const { mutateAsync: createPost } = useCreatePost();

  const handlePlaceSelect = (place: KakaoPlace | null) => {
    setSelectedPlace(place);
  };

  const resetForm = () => {
    setContent('');
    setRating(0);
    setPhotos([]);
    setSelectedPlace(null);
  };

  // Fixing the bug: The original code had a separate logic inside handleFileChange.
  // It calculated tempUrls and S3 URLs.
  // Actually, I should fix the uploading state logic.
  // Let's rewrite uploadImages to return the S3 URLs or update the state correctly.

  const handleUploadAndSetImages = async (fileList: File[]) => {
    const remainingSlots = 5 - photos.length;
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
      async (
        item: { originalName: string; fileName: string; url: string },
        index: number,
      ) => {
        const file = filesToUpload[index];
        try {
          const s3Res = await fetch(item.url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });
          if (!s3Res.ok) throw new Error(`S3 Error: ${s3Res.status}`);
          return item.url.split('?')[0];
        } catch (err) {
          console.error('S3 Upload Error:', err);
          throw new Error('S3 CORS or Network Error');
        }
      },
    );

    try {
      const s3Urls = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...s3Urls]);
    } catch (err) {
      console.error(err);
    }
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
      // Need user ID. The original code fetched it inside submit.
      // createPost hook handles the insertion.
      // I need to fetch user inside here or rely on createPost to have userId?
      // createPost payload requires userId.
      // Let's import supabase client here to get user.
      const supabase = createClient();
      // TODO: user 정보를 tanstack query로 관리하기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      await createPost({
        content,
        rating,
        image_urls: photos,
        place_name: selectedPlace.place_name,
        address: selectedPlace.road_address_name || selectedPlace.address_name,
        lat: parseFloat(selectedPlace.y),
        lng: parseFloat(selectedPlace.x),
        kakao_place_id: selectedPlace.id,
        user_id: user.id,
      });

      alert('게시글이 등록되었습니다!');
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert('게시글 등록에 실패했습니다.');
    }
  };

  return {
    formState: {
      content,
      rating,
      photos,
      selectedPlace,
      currentLocation,
    },
    handlers: {
      setContent,
      setRating,
      handleUploadAndSetImages,
      handleRemovePhoto: (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
      },
      fetchCurrentLocation,
      handlePlaceSelect,
      resetForm,
    },
    submit: handleSubmit,
  };
};
