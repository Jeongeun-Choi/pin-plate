import type { PlaceWithStats } from '@/features/place/types/place';
import type { TagGroup } from '@/features/post/constants/tags';

export interface PlaceSelectionState {
  criteriaKey: string;
  selectedPlaceIds: string[];
  hasCustomSelection: boolean;
}

export interface ShareableTagOption {
  value: string;
  label: string;
  group: TagGroup;
  count: number;
}

export interface ShareableStatusOption {
  value: string;
  label: string;
  count: number;
}

export interface ShareableTagOptionWithOrder extends ShareableTagOption {
  order: number;
}

export interface ShareableRegionOption {
  value: string;
  label: string;
  count: number;
  searchText: string;
}

export interface ShareMapPlacePickerModel {
  candidatePlaces: PlaceWithStats[];
  selectedPlaceIdSet: Set<string>;
  selectedSnapshotPlaceCount: number;
}
