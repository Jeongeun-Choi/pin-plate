import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/getMyProfile';
import { myPageKeys } from '../myPageKeys';

export const useMyProfile = () => {
  return useQuery({
    queryKey: myPageKeys.profile(),
    queryFn: getMyProfile,
  });
};
