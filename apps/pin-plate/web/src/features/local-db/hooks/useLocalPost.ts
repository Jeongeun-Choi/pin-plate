import { useQuery } from '@tanstack/react-query';
import { localPostRepository } from '../repositories/localPostRepository';
import { localDbKeys } from '../localDbKeys';

export const useLocalPost = (id: string, enabled = true) =>
  useQuery({
    queryKey: localDbKeys.post(id),
    queryFn: () => localPostRepository.getByIdWithUrls(id),
    staleTime: Infinity,
    enabled,
  });
