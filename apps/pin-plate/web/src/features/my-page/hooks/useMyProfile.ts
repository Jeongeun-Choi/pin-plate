import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/getMyProfile';

export const MY_PAGE_KEYS = {
  all: ['my-page'] as const,
  profile: () => [...MY_PAGE_KEYS.all, 'profile'] as const,
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: MY_PAGE_KEYS.profile(),
    queryFn: getMyProfile,
  });
};
