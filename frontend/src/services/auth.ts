import { mutate } from 'swr';

export const AUTH_ME_KEY = '/auth/me';

export const mutateAuth = (): void => {
  mutate(
    key => {
      if (Array.isArray(key)) {
        return key[0] === AUTH_ME_KEY;
      }
      return key === AUTH_ME_KEY;
    },
    null,
    false,
  );
};