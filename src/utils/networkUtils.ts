const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const fetchWithRetry = async <T>(
  fetchFunction: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  try {
    return await fetchFunction();
  } catch (error: any) {
    if (retries > 0 && isNetworkError(error)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(fetchFunction, retries - 1);
    }
    throw error;
  }
};

export const isNetworkError = (error: any): boolean => {
  return error?.message?.includes('network request failed') ?? false;
};
