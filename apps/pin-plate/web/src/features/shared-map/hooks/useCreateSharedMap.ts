import { useMutation } from '@tanstack/react-query';
import { createSharedMap } from '../api/createSharedMap';
import type { CreateSharedMapPayload } from '../types/sharedMap';

interface CreateSharedMapVariables {
  ownerId: string;
  payload: CreateSharedMapPayload;
}

export const useCreateSharedMap = () =>
  useMutation({
    mutationFn: ({ ownerId, payload }: CreateSharedMapVariables) =>
      createSharedMap(ownerId, payload),
  });
