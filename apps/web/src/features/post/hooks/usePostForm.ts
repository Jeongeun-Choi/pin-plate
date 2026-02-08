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

    // 1. 이미 주입된 위치 정보가 있는지 확인
    if (window.nativeLocation) {
      const { coords } = window.nativeLocation;
      setCurrentLocation({
        lat: coords.latitude,
        lng: coords.longitude,
      });
      return;
    }

    // 2. 앱 환경이라면 위치 정보 요청 (Bridge)
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'REQ_LOCATION' }),
      );
      // 위치 정보가 비동기로 주입되므로, 잠시 후 다시 시도해달라는 메시지 표시
      // (더 나은 UX는 주입될 때까지 로딩을 보여주는 것이지만, 일단 기능 동작 확인이 우선)
      alert('위치 정보를 불러오는 중입니다. 잠시 후 닫았다가 다시 열어주세요.');
      return;
    }

    // 3. 웹 환경 (HTTPS 필요)
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
          alert(`위치 정보 에러: ${error.code} - ${error.message}`);
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

    // 1. Presigned URL Request
    let presignedRes;
    try {
      presignedRes = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: fileList.map((f) => ({ filename: f.name, type: f.type })),
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
        const file = fileList[index];
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
