export interface GuestPost {
  id: string;
  created_at: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  content: string;
  rating: number;
  image_urls: string[];
  tags: string[];
}
