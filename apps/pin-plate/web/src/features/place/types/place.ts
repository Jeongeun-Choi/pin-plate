import type { Post } from '@/features/post/types/post';

export type PlaceStatus = 'wish' | 'visited' | 'want_to_revisit' | 'recommend';

export interface Place {
  id: string;
  user_id: string;
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  status: PlaceStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePlacePayload {
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  status: PlaceStatus;
  tags: string[];
}

export interface PlaceWithStats extends Place {
  posts: Pick<Post, 'id' | 'rating' | 'image_urls' | 'created_at'>[];
  visit_count: number;
  avg_rating: number | null;
  last_visited_at: string | null;
  first_image: string | null;
}
