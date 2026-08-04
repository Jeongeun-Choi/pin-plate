import { useMutation } from '@tanstack/react-query';
import {
  requestPasswordReset,
  updatePassword,
  type PasswordResetRequestParams,
  type PasswordUpdateParams,
} from '../api/auth';

export const usePasswordResetRequest = () => {
  return useMutation({
    mutationFn: (params: PasswordResetRequestParams) =>
      requestPasswordReset(params),
  });
};

export const usePasswordUpdate = () => {
  return useMutation({
    mutationFn: (params: PasswordUpdateParams) => updatePassword(params),
  });
};
