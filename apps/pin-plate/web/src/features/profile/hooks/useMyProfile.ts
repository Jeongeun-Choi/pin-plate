import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/getMyProfile';
import { profileKeys } from '../profileKeys';

export const useMyProfile = () => {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: getMyProfile,
  });
};
