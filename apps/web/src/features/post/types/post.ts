export interface CreatePostPayload {
  content: string;
  rating: number;
  image_urls: string[];
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  user_id: string;
}
