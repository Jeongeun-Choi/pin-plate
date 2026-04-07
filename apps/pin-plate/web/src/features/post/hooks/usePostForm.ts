import { useState } from 'react';
import { useCreatePost } from './useCreatePost';
import { KakaoPlace } from '../types/search';
import { createClient } from '@/utils/supabase/client';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useUploadImages } from './useUploadImages';

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

  const { handleUploadAndSetImages } = useUploadImages(photos, setPhotos);

  const handlePlaceSelect = (place: KakaoPlace | null) => {
    setSelectedPlace(place);
  };

  const resetForm = () => {
    setContent('');
    setRating(0);
    setPhotos([]);
    setSelectedPlace(null);
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
