import { useState } from 'react';
import { useUpdatePost } from './useUpdatePost';
import { KakaoPlace } from '../types/search';
import { Post } from '../types/post';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useUploadImages } from './useUploadImages';

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

  const { location: currentLocation, fetchLocation: fetchCurrentLocation } =
    useCurrentLocation();

  const { mutateAsync: updatePost } = useUpdatePost();

  const { handleUploadAndSetImages } = useUploadImages(photos, setPhotos);

  const handlePlaceSelect = (place: KakaoPlace | null) => {
    setSelectedPlace(place);
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
    } catch (error: any) {
      console.error('Update Post Error:', error);

      // Supabase error handling
      if (error?.code) {
        alert(
          `게시글 수정 실패 (${error.code}): ${error.message}\n(내 글이 아니거나 권한이 없을 수 있습니다)`,
        );
      } else {
        alert(
          `게시글 수정에 실패했습니다.\n${error?.message || '알 수 없는 오류'}`,
        );
      }
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
      handleRemovePhoto,
      fetchCurrentLocation,
      handlePlaceSelect,
    },
    submit: handleSubmit,
  };
};
