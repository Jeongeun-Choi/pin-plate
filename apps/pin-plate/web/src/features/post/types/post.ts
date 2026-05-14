export interface CreatePostPayload {
  place_id?: string;
  content: string;
  rating: number;
  image_urls: string[];
  image_keys?: string[];
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  user_id: string;
  tags: string[];
}

export interface Post extends CreatePostPayload {
  id: number;
  created_at: string;
}
