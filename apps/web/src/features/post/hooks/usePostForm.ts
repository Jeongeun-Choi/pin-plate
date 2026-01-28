import { useState } from 'react';
import { useCreatePost } from './useCreatePost';
import { KakaoPlace } from '../types/search';
import { createClient } from '@/utils/supabase/client';

export const usePostForm = (onSuccess?: () => void) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  }>();

  const { mutateAsync: createPost } = useCreatePost();

  const handleLocationSearchOpen = () => {
    setIsLocationModalOpen(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('위치 정보를 가져올 수 없습니다.', error);
        },
      );
    }
  };

  const handlePlaceSelect = (place: KakaoPlace) => {
    setSelectedPlace(place);
    setIsLocationModalOpen(false);
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

    try {
      // 1. Presigned URL Request
      const presignedRes = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: fileList.map((f) => ({ filename: f.name, type: f.type })),
        }),
      });

      if (!presignedRes.ok) throw new Error('Failed to get presigned URLs');

      const { urls } = await presignedRes.json();

      // 2. Upload to S3
      const uploadPromises = urls.map(async (item: any, index: number) => {
        const file = fileList[index];
        await fetch(item.url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        return item.url.split('?')[0];
      });

      const s3Urls = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...s3Urls]);
    } catch (error) {
      console.error(error);
      alert('이미지 업로드에 실패했습니다.');
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
      isLocationModalOpen,
      currentLocation,
    },
    handlers: {
      setContent,
      setRating,
      handleUploadAndSetImages,
      handleLocationSearchOpen,
      handlePlaceSelect,
      handleLocationModalClose: () => setIsLocationModalOpen(false),
    },
    submit: handleSubmit,
  };
};
