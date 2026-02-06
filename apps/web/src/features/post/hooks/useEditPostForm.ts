import { useState } from 'react';
import { useUpdatePost } from './useUpdatePost';
import { KakaoPlace } from '../types/search';
import { Post } from '../types/post';

export const useEditPostForm = (initialData: Post, onSuccess?: () => void) => {
  const [content, setContent] = useState(initialData.content);
  const [rating, setRating] = useState(initialData.rating);
  const [photos, setPhotos] = useState<string[]>(initialData.image_urls || []);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>({
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

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  }>();

  const { mutateAsync: updatePost } = useUpdatePost();

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

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
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
      await updatePost({
        id: initialData.id,
        payload: {
          content,
          rating,
          image_urls: photos,
          place_name: selectedPlace.place_name,
          address:
            selectedPlace.road_address_name || selectedPlace.address_name,
          lat: parseFloat(selectedPlace.y),
          lng: parseFloat(selectedPlace.x),
          kakao_place_id: selectedPlace.id,
        },
      });

      alert('게시글이 수정되었습니다!');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert('게시글 수정에 실패했습니다.');
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
      handleRemovePhoto, // Added this new handler
      handleLocationSearchOpen,
      handlePlaceSelect,
      handleLocationModalClose: () => setIsLocationModalOpen(false),
    },
    submit: handleSubmit,
  };
};
