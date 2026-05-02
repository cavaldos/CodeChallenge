import { mutate } from 'swr';

export const AUTH_ME_KEY = '/auth/me';

/**
 * Mutate auth-related SWR cache entries.
 *
 * @param revalidate - when true (default) will revalidate matching keys; when false will clear the cache without revalidation (useful for logout)
 */
export const mutateAuth = async (revalidate = true): Promise<void> => {
  const isAuthKey = (key: unknown): boolean => {
    if (Array.isArray(key)) {
      // keys used by SWR can be arrays like ["/auth/me", params]
      return key[0] === AUTH_ME_KEY;
    }
    return key === AUTH_ME_KEY;
  };

  if (revalidate) {
    // revalidate matching keys
    await mutate(isAuthKey);
    return;
  }

  // clear matching keys without revalidation (fast logout UX)
  await mutate(isAuthKey, null, false);
};
