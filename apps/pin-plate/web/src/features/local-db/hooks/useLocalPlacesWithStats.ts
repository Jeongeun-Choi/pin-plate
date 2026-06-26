import { useQuery } from '@tanstack/react-query';
import { localPlaceRepository } from '../repositories/localPlaceRepository';
import { localDbKeys } from '../localDbKeys';

export const useLocalPlacesWithStats = () =>
  useQuery({
    queryKey: localDbKeys.placesWithStats(),
    queryFn: () => localPlaceRepository.getWithStats(),
    staleTime: Infinity,
  });
